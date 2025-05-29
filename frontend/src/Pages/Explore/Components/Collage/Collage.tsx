import { getImageURL } from "../../../../Utils/image";

interface Props {
  images: string[];
  height: number;
}

export const Collage = ({ images, height }: Props) => {
  const numImages = images.length;

  if (numImages <= 2) {
    return (
      <div
        style={{
          display: "flex",
          gap: 1,
          height,
          width: (height * 3) / 2 + 1,
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <div style={{ flex: 1 }}>
          <img
            src={getImageURL(images[0])}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
          }}
        >
          <img
            src={getImageURL(images[1])}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 1,
        height,
        width: (height * 3) / 2 + 1,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Left: Large image */}
      <div style={{ flex: 2 }}>
        <img
          src={getImageURL(images[0])}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Right: Two stacked images */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <img
          src={getImageURL(images[1])}
          style={{
            width: "100%",
            height: "50%",
            objectFit: "cover",
          }}
        />
        <img
          src={getImageURL(images[2])}
          style={{
            width: "100%",
            height: "50%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
};
