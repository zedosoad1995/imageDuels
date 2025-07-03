import { CloseButton, Group, Text, Tooltip } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { getImageURL } from "../../../../../../Utils/image";
import VotingIcon from "../../../../../../assets/svgs/ballot.svg?react";
import ScoreIcon from "../../../../../../assets/svgs/leaderboard.svg?react";
import { useEffect, useState } from "react";
import { useHotkeys, useMediaQuery } from "@mantine/hooks";
import { EmblaCarouselType } from "embla-carousel";
import { IGetCollection } from "../../../../../../Types/collection";
import classes from "./ImageFullscreenModal.module.css";

interface Props {
  images: IGetCollection["images"];
  currIndex: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}

export const ImageFullScreenModal = ({
  currIndex,
  images,
  isOpen,
  onClose,
}: Props) => {
  const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
  const isLaptopOrTablet = useMediaQuery("(min-width: 800px)");

  useHotkeys([
    ["ArrowLeft", () => embla?.scrollPrev()],
    ["ArrowRight", () => embla?.scrollNext()],
  ]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (currIndex === undefined || !isOpen) {
    return null;
  }

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
        getEmblaApi={setEmbla}
        emblaOptions={{
          align: "center",
        }}
        slideGap={0}
        initialSlide={currIndex}
        styles={{
          control: {
            background: "rgba(0,0,0,0.3)",
            color: "white",
            border: "none",
          },
        }}
        withControls={isLaptopOrTablet}
      >
        {images.map(({ filepath, numVotes, percentile }, i) => (
          <Carousel.Slide
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
            key={i}
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
                  label={`Score: ${(percentile * 100).toFixed(
                    1
                  )}% (Better than ${(percentile * 100).toFixed(
                    1
                  )}% of the images)`}
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
        ))}
      </Carousel>
    </div>
  );
};
