import { getImageURL } from "../../Utils/image";

interface Props {
  filepath: string;
}

export const Image = ({ filepath }: Props) => {
  return (
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
  );
};
