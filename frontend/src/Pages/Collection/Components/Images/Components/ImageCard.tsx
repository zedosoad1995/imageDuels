import { CloseButton, Group, Text } from "@mantine/core";
import { useContext } from "react";
import { modals } from "@mantine/modals";
import { CollectionContext } from "../../../../../Contexts/CollectionContext";
import { deleteImage } from "../../../../../Api/images";
import { getImageURL } from "../../../../../Utils/image";
import VotingIcon from "../../../../../assets/svgs/ballot.svg?react";
import ScoreIcon from "../../../../../assets/svgs/leaderboard.svg?react";
import classes from "./ImageCard.module.css";

interface Props {
  filepath: string;
  canDelete: boolean;
  percentile: number;
  numVotes: number;
  imageId: string;
}

export const ImageCard = ({
  filepath,
  canDelete,
  imageId,
  percentile,
  numVotes,
}: Props) => {
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
      onConfirm: handleDelete,
    });

  return (
    <div className={classes.root}>
      {canDelete && (
        <CloseButton
          className={classes.closeButton}
          variant="transparent"
          color="white"
          onClick={openDeleteModal}
        />
      )}
      <img
        src={getImageURL(filepath)}
        style={{ display: "block", width: "100%" }}
      />
      <Group
        px={8}
        gap={12}
        justify="flex-end"
        style={{
          position: "absolute",
          bottom: "2px",
          zIndex: 2,
          width: "100%",
        }}
      >
        <Group gap={4}>
          <ScoreIcon height={16} fill="white" />
          <Text
            fw={600}
            style={{
              color: "white",
            }}
          >
            {(percentile * 100).toFixed(1)}%
          </Text>
        </Group>

        <Group gap={4}>
          <VotingIcon height={16} fill="white" />
          <Text
            fw={600}
            style={{
              color: "white",
            }}
          >
            {numVotes}
          </Text>
        </Group>
      </Group>
      {canDelete && <div className={classes.overlayTop} />}
      <div className={classes.overlayBottom} />
    </div>
  );
};
