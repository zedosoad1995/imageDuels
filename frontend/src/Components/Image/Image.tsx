import { useRef, useState } from "react";
import { getImageURL } from "../../Utils/image";

interface Props {
  filepath: string;
  hasPlaceholder: boolean;
  availableWidths: number[];
  isSvg: boolean;
  style?: React.CSSProperties | undefined;
  innerStyle?: React.CSSProperties | undefined;
  objectFit?: "contain" | "cover";
  sizes?: string;
  onClick?: React.MouseEventHandler | undefined;
}

export const Image = ({
  filepath,
  isSvg,
  style,
  innerStyle,
  availableWidths,
  hasPlaceholder,
  objectFit,
  sizes = "(max-width: 600px) 100vw, (max-width: 1200px) 800px, 1200px",
  onClick,
}: Props) => {
  const [loaded, setLoaded] = useState(false);
  const [animate, setAnimate] = useState(false);

  const loadStartRef = useRef<number>(Date.now());

  const onLoad = () => {
    const elapsed = Date.now() - loadStartRef.current;

    // animate only if it took "long enough"
    if (elapsed > 120) {
      setAnimate(true);
    }

    setLoaded(true);
  };

  const baseUrl = getImageURL(filepath);

  if (!baseUrl) {
    return null;
  }

  if (!hasPlaceholder && !availableWidths.length) {
    return <img src={baseUrl} style={style} onClick={onClick} />;
  }

  if (isSvg) {
    return <img src={baseUrl + "/svg.svg"} style={style} onClick={onClick} />;
  }

  if (!availableWidths.length) {
    return (
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundImage: `url("${baseUrl}/placeholder.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          ...style,
        }}
        onClick={onClick}
      >
        <img
          src={baseUrl}
          loading="lazy"
          decoding="async"
          onLoad={onLoad}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            opacity: loaded ? 1 : 0,
            transition: animate ? "opacity 250ms ease" : "none",
            display: "block",
            ...(innerStyle ?? style),
          }}
        />
      </div>
    );
  }

  const webpSrcSet = availableWidths
    .map((w) => `${baseUrl}/w${w}.webp ${w}w`)
    .join(", ");

  const jpgSrcSet = availableWidths
    .map((w) => `${baseUrl}/w${w}.jpg ${w}w`)
    .join(", ");

  const defaultWidth = availableWidths[Math.floor(availableWidths.length / 2)];
  const fallbackSrc = `${baseUrl}/w${defaultWidth}.jpg`;

  return (
    <div
      className="img-wrapper"
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundImage: hasPlaceholder
          ? `url("${baseUrl}/placeholder.jpg")`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: hasPlaceholder && !loaded ? "blur(12px)" : undefined,
        transition: animate ? "filter 100ms ease" : "none",
        ...style,
      }}
      onClick={onClick}
    >
      <picture>
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        <img
          src={fallbackSrc}
          srcSet={jpgSrcSet}
          sizes={sizes}
          loading="lazy"
          decoding="async"
          onLoad={onLoad}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            opacity: loaded ? 1 : 0,
            transition: animate ? "opacity 100ms ease" : "none",
            display: "block",
            ...(innerStyle ?? style),
          }}
        />
      </picture>
    </div>
  );
};
