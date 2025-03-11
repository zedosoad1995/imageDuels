import { CloseButton, Text } from "@mantine/core";
import { getImageURL } from "../../Utils/image";
import classes from "./Image.module.css";
import { deleteImage } from "../../Api/images";
import { useContext } from "react";
import { CollectionContext } from "../../Contexts/CollectionContext";
import { modals } from "@mantine/modals";

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

  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: "Delete image",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this image? This action is
          irreversible.
        </Text>
      ),
      labels: { confirm: "Delete image", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: handleDelete,
    });

  return (
    <div className={classes.root}>
      {canEdit && (
        <>
          <CloseButton
            className={classes.closeButton}
            variant="transparent"
            color="white"
            onClick={openDeleteModal}
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
