import { CloseButton, Group, Text, Tooltip } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useHotkeys, useMediaQuery } from "@mantine/hooks";
import { EmblaCarouselType } from "embla-carousel";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getImageURL } from "../../../../../../Utils/image";
import VotingIcon from "../../../../../../assets/svgs/ballot.svg?react";
import ScoreIcon from "../../../../../../assets/svgs/leaderboard.svg?react";
import { IGetCollection } from "../../../../../../Types/collection";
import classes from "./ImageFullscreenModal.module.css";
import { MEDIA_QUERY_DESKTOP } from "../../../../../../Utils/breakpoints";
import { CollectionContext } from "../../../../../../Contexts/CollectionContext";

const WINDOW_SIZE = 40;
const EDGE_THRESHOLD = 1;
const EDGE_FETCH_THRESHOLD = 1;
const STABILIZATION_TH = 50; // Distance between slide and target, to consider stable, and move the window. Too high values will make the animation feel clunky

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

interface Props {
  images: IGetCollection["images"];
  initIndex: number | undefined;
  isOpen: boolean;
  onClose: () => void;
  hasMoreImagesToLoad: boolean;
  isLoadingFetch: boolean;
}

export const ImageFullScreenModal = ({
  initIndex,
  images,
  isOpen,
  onClose,
  hasMoreImagesToLoad,
  isLoadingFetch,
}: Props) => {
  const { fetchCollection } = useContext(CollectionContext);

  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
  const isLaptopOrTablet = useMediaQuery(MEDIA_QUERY_DESKTOP);

  // Virtualization window [start, end)
  const [start, setStart] = useState(
    (initIndex ?? 0) - Math.floor(WINDOW_SIZE / 2)
  );
  const total = images.length;
  const end = useMemo(
    () => Math.min(total, start + WINDOW_SIZE),
    [total, start]
  );

  // Global selection bookkeeping
  const selectedGlobalRef = useRef(0);
  const maxAchievedGlobalRef = useRef(0);

  // Shift bookkeeping
  const shiftingRef = useRef(false);
  const pendingShiftRef = useRef<null | {
    selectedGlobal: number;
    newStart: number;
  }>(null);

  // Stabilization check (same as your working version)
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    setStart((initIndex ?? 0) - Math.floor(WINDOW_SIZE / 2));
  }, [initIndex]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const didInitRef = useRef(false);

  useEffect(() => {
    if (!isOpen || initIndex == null) return;

    // reset guard when closing
    if (!isOpen) didInitRef.current = false;
  }, [isOpen, initIndex]);

  useEffect(() => {
    if (!isOpen || initIndex == null) return;

    // Only do this once per open (or when initIndex changes)
    if (didInitRef.current) return;
    didInitRef.current = true;

    const init = clamp(initIndex, 0, Math.max(0, total - 1));
    selectedGlobalRef.current = init;

    const targetRel = Math.floor(WINDOW_SIZE / 2);
    const newStart = clamp(
      init - targetRel,
      0,
      Math.max(0, total - WINDOW_SIZE)
    );
    setStart(newStart);
  }, [isOpen, initIndex, total]);

  const windowedImages = useMemo(
    () => images.slice(start, end),
    [images, start, end]
  );

  // Hotkeys
  useHotkeys([
    ["ArrowLeft", () => embla?.scrollPrev()],
    ["ArrowRight", () => embla?.scrollNext()],
  ]);

  const requestShiftAround = useCallback(
    (selectedGlobal: number) => {
      if (total <= WINDOW_SIZE) return;

      const targetRel = Math.floor(WINDOW_SIZE / 2);
      const newStart = clamp(
        selectedGlobal - targetRel,
        0,
        Math.max(0, total - WINDOW_SIZE)
      );

      if (newStart === start) return;

      shiftingRef.current = true;
      pendingShiftRef.current = { selectedGlobal, newStart };
      setStart(newStart);
    },
    [start, total]
  );

  const maybeShiftWindow = useCallback(() => {
    if (!embla || shiftingRef.current) return;

    const rel = embla.selectedScrollSnap();

    const lastRel = windowedImages.length - 1;
    const nearLeft = rel <= EDGE_THRESHOLD;
    const nearRight = rel >= lastRel - EDGE_THRESHOLD;

    const hasLeft = start > 0;
    const hasRight = end < total;

    if ((nearLeft && hasLeft) || (nearRight && hasRight)) {
      requestShiftAround(selectedGlobalRef.current);
    }
  }, [embla, start, end, total, windowedImages.length, requestShiftAround]);

  // Check "stable enough", then maybe shift (same idea as your VirtualizedCarousel)
  const scheduleMaybeShift = useCallback(() => {
    if (!embla || shiftingRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (!embla || shiftingRef.current) return;

      const engine = embla.internalEngine?.();
      if (!engine) return;

      const loc = engine.location.get();
      const target = engine.target.get();
      const dist = Math.abs(loc - target);

      const rel = embla.selectedScrollSnap();
      const selectedGlobal = start + rel;
      selectedGlobalRef.current = selectedGlobal;
      if (selectedGlobalRef.current > maxAchievedGlobalRef.current) {
        maxAchievedGlobalRef.current = selectedGlobalRef.current;
      }

      // Keep your same “loose” threshold so it triggers quickly
      if (dist > STABILIZATION_TH) return;

      maybeShiftWindow();
    });
  }, [embla, maybeShiftWindow]);

  // Subscribe to scroll
  useEffect(() => {
    if (!embla) return;

    const onScroll = () => scheduleMaybeShift();
    embla.on("scroll", onScroll);

    requestAnimationFrame(() => scheduleMaybeShift());

    return () => {
      embla.off("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [embla, scheduleMaybeShift]);

  useEffect(() => {
    if (!embla) return;

    const onSelect = () => {
      const rel = embla.selectedScrollSnap();
      const selectedGlobal = start + rel;

      if (
        selectedGlobal > maxAchievedGlobalRef.current &&
        selectedGlobalRef.current >= images.length - 1 - EDGE_FETCH_THRESHOLD &&
        hasMoreImagesToLoad &&
        !isLoadingFetch
      ) {
        fetchCollection({ useCursor: true });
      }
    };
    embla.on("select", onSelect);

    return () => {
      embla.off("select", onSelect);
    };
  }, [embla, start, total]);

  // Apply pending shift AFTER render
  useEffect(() => {
    if (!embla) return;
    const pending = pendingShiftRef.current;
    if (!pending) return;

    requestAnimationFrame(() => {
      if (!embla) return;

      embla.reInit();
      const newRel = pending.selectedGlobal - pending.newStart;
      embla.scrollTo(newRel, true);

      pendingShiftRef.current = null;
      shiftingRef.current = false;
    });
  }, [embla, start, windowedImages.length]);

  if (initIndex == null || !isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px) saturate(1.8)",
        WebkitBackdropFilter: "blur(10px) saturate(1.8)",
        overflow: "hidden",
      }}
    >
      <CloseButton
        size="sm"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          cursor: "pointer",
          zIndex: 10,
          color: "white",
          borderRadius: "100%",
          background: "rgba(0, 0, 0, 0.3)",
        }}
        className={classes.closeButton}
        onClick={onClose}
      />

      <Carousel
        slideSize="100%"
        slideGap={0}
        initialSlide={initIndex - start}
        getEmblaApi={setEmbla}
        emblaOptions={{ align: "center", containScroll: "trimSnaps" }}
        styles={{
          control: {
            background: "rgba(0,0,0,0.3)",
            color: "white",
            border: "none",
          },
        }}
        withControls={isLaptopOrTablet}
      >
        {windowedImages.map(
          ({ filepath, numVotes, percentile, height, width, id }) => {
            if (!filepath || filepath.trim() === "") {
              return null;
            }

            const isSvg = filepath.split("?")[0].toLowerCase().endsWith(".svg");

            const maxDim = Math.max(height, width);

            let transformedH: number | "auto" = "auto";
            let transformedW: number | "auto" = "auto";

            if (isSvg) {
              if (maxDim < 200) {
                transformedH = 200;
                transformedW = 200;
              } else {
                transformedH = height;
                transformedW = width;
              }
            }

            return (
              <Carousel.Slide
                key={id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                <div
                  onClick={onClose}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    cursor: "pointer",
                  }}
                />

                <div
                  style={{
                    textAlign: "center",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minHeight: 0,
                    minWidth: 0,
                    zIndex: 1,
                  }}
                >
                  <div
                    onClick={onClose}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      cursor: "pointer",
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      minWidth: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={getImageURL(filepath)}
                      style={{
                        margin: "0 auto",
                        objectFit: "contain",
                        maxHeight: "calc(100vh - 30px)",
                        maxWidth: "100%",
                        zIndex: 1,
                        display: "block",
                        height: transformedH,
                        width: transformedW,
                      }}
                    />
                  </div>

                  <Group
                    px={8}
                    gap={12}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      zIndex: 1,
                      height: 25,
                    }}
                  >
                    <Tooltip
                      zIndex={1000000}
                      label={`Score: ${(percentile * 100).toFixed(1)}%`}
                      events={{ hover: true, focus: false, touch: true }}
                    >
                      <Group gap={4} style={{ cursor: "pointer" }}>
                        <ScoreIcon height={16} />
                        <Text fw={600}>{(percentile * 100).toFixed(1)}%</Text>
                      </Group>
                    </Tooltip>

                    <Tooltip
                      zIndex={1000000}
                      label={`${numVotes} votes`}
                      events={{ hover: true, focus: false, touch: true }}
                    >
                      <Group gap={4} style={{ cursor: "pointer" }}>
                        <VotingIcon height={16} />
                        <Text fw={600}>{numVotes}</Text>
                      </Group>
                    </Tooltip>
                  </Group>
                </div>
              </Carousel.Slide>
            );
          }
        )}
      </Carousel>
    </div>
  );
};
