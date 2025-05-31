import { getImageURL } from "../../../../Utils/image";
import classes from "./Collage.module.css";

interface Props {
  images: string[];
}

export const Collage = ({ images }: Props) => {
  const numImages = images.length;

  if (numImages <= 2) {
    return (
      <div className={classes.base}>
        <div className={classes.overlay} />
        <div className={classes.images}>
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
      </div>
    );
  }

  return (
    <div className={classes.base}>
      <div className={classes.overlay} />
      <div className={classes.images}>
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
    </div>
  );
};
