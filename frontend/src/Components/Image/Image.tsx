import { CloseButton } from "@mantine/core";
import { getImageURL } from "../../Utils/image";
import classes from "./Image.module.css";
import { deleteImage } from "../../Api/images";
import { useContext } from "react";
import { CollectionContext } from "../../Contexts/CollectionContext";

interface Props {
  filepath: string;
  canEdit?: boolean;
  imageId?: string;
}

export const Image = ({ filepath, canEdit = false, imageId }: Props) => {
  const { fetchCollection } = useContext(CollectionContext);

  const handleDelete = async () => {
    if (!imageId) return;

    await deleteImage(imageId);
    fetchCollection();
  };

  return (
    <div className={classes.root}>
      {canEdit && (
        <>
          <CloseButton
            className={classes.closeButton}
            variant="transparent"
            color="white"
            onClick={handleDelete}
          />
          <div className={classes.overlay} />
        </>
      )}
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
