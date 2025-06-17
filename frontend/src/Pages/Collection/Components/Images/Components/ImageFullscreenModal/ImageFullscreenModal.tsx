import { Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { getImageURL } from "../../../../../../Utils/image";
import { useEffect, useState } from "react";
import { useHotkeys } from "@mantine/hooks";
import { EmblaCarouselType } from "embla-carousel";

interface Props {
  images: string[];
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
      <Carousel
        slideSize="100%"
        getEmblaApi={setEmbla}
        emblaOptions={{
          align: "center",
        }}
        slideGap={0}
        initialSlide={currIndex}
        styles={{
          control: { background: "rgba(0,0,0,0.3)" },
        }}
      >
        {images.map((img, i) => (
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
                  src={getImageURL(img)}
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
              <div style={{ textAlign: "center", zIndex: 1, height: 25 }}>
                <Text>lala</Text>
              </div>
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  );
};
