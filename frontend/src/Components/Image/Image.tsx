import { getImageURL } from "../../Utils/image";
import classes from "./Image.module.css";

interface Props {
  filepath: string;
}

export const Image = ({ filepath }: Props) => {
  return (
    <div className={classes.root}>
      <div
        style={{
          backgroundImage: `url(${getImageURL(filepath)})`,
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
