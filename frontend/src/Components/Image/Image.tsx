import { getImageURL } from "../../Utils/image";
import classes from "./Image.module.css";

interface Props {
  filepath: string;
}

export const Image = ({ filepath }: Props) => {
  const imageURL = getImageURL(filepath);
  
  if (!imageURL) {
    return null;
  }

  return (
    <div className={classes.root}>
      <div
        style={{
          backgroundImage: `url(${imageURL})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          width: "100%",
          paddingTop: "100%",
        }}
      />
    </div>
  );
};
