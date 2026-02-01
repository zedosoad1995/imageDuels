import { Image } from "../Image/Image";
import classes from "./Collage.module.css";

interface Props {
  images: {
    filepath: string;
    hasPlaceholder: boolean;
    availableWidths: number[];
    availableFormats: string[];
    isSvg: boolean;
  }[];
}

export const Collage = ({ images }: Props) => {
  const numImages = images.length;

  if (numImages === 0) {
    return (
      <div className={classes.base}>
        <div className={classes.overlay} />
        <div className={classes.images} style={{ padding: 12 }}>
          <img
            src="/my-logo.svg"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
              opacity: 0.15,
              filter: "grayscale(100%)",
            }}
          />
        </div>
      </div>
    );
  }

  if (numImages === 1) {
    return (
      <div className={classes.base}>
        <div className={classes.overlay} />
        <div className={classes.images}>
          <div style={{ flex: 1 }}>
            <Image
              {...images[0]}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              objectFit="cover"
              sizes="(max-width: 575px) 50vw, (max-width: 799px) 24vw, (max-width: 1199px) 23vw, (max-width: 1407px) 15vw, (max-width: 1800px) 12vw, 225px"
            />
          </div>

          <div
            style={{
              flex: 1,
              padding: 12,
            }}
          >
            <img
              src="/my-logo.svg"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
                opacity: 0.15,
                filter: "grayscale(100%)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (numImages === 2) {
    return (
      <div className={classes.base}>
        <div className={classes.overlay} />
        <div className={classes.images}>
          <div style={{ flex: 1 }}>
            <Image
              {...images[0]}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              objectFit="cover"
              sizes="(max-width: 575px) 50vw, (max-width: 799px) 24vw, (max-width: 1199px) 23vw, (max-width: 1407px) 15vw, (max-width: 1800px) 12vw, 225px"
            />
          </div>

          <div
            style={{
              flex: 1,
            }}
          >
            <Image
              {...images[1]}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              objectFit="cover"
              sizes="(max-width: 575px) 50vw, (max-width: 799px) 24vw, (max-width: 1199px) 23vw, (max-width: 1407px) 15vw, (max-width: 1800px) 12vw, 225px"
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
          <Image
            {...images[0]}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            objectFit="cover"
            sizes="(max-width: 575px) 65vw, (max-width: 799px) 32vw, (max-width: 1199px) 29vw, (max-width: 1407px) 20vw, (max-width: 1800px) 15vw, 275px"
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
          <Image
            {...images[1]}
            style={{
              width: "100%",
              height: "50%",
              objectFit: "cover",
            }}
            innerStyle={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            objectFit="cover"
            sizes="(max-width: 575px) 33vw, (max-width: 799px) 16vw, (max-width: 1199px) 15vw, (max-width: 1407px) 10vw, (max-width: 1800px) 8vw, 140px"
          />
          <Image
            {...images[2]}
            style={{
              width: "100%",
              height: "50%",
              objectFit: "cover",
            }}
            innerStyle={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            objectFit="cover"
            sizes="(max-width: 575px) 33vw, (max-width: 799px) 16vw, (max-width: 1199px) 15vw, (max-width: 1407px) 10vw, (max-width: 1800px) 8vw, 140px"
          />
        </div>
      </div>
    </div>
  );
};
