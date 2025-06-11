import { Modal, Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { getImageURL } from "../../../../../../Utils/image";

interface Props {
  images: string[];
  currIndex: number;
  isOpen: boolean;
}

export const ImageFullScreenModal = ({ currIndex, images, isOpen }: Props) => {
  return (
    <Modal
      fullScreen
      opened={isOpen}
      onClose={() => {}}
      withCloseButton={false}
      padding={0}
      centered
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          justifyContent: "center",
        },
      }}
    >
      <Carousel
        slideSize="100%"
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
            key={i}
            style={{
              textAlign: "center",
              height: "100vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              minHeight: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
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
                  maxHeight: "100%",
                  maxWidth: "100%",
                }}
              />
            </div>
            <Text mt="sm">lala</Text>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Modal>
  );
};
