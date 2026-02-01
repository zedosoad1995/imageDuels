import { CloseButton, Group, Text, Tooltip } from "@mantine/core";
import { useContext } from "react";
import { modals } from "@mantine/modals";
import { CollectionContext } from "../../../../../../Contexts/CollectionContext";
import { deleteImage } from "../../../../../../Api/images";
import { getImageURL } from "../../../../../../Utils/image";
import VotingIcon from "../../../../../../assets/svgs/ballot.svg?react";
import ScoreIcon from "../../../../../../assets/svgs/leaderboard.svg?react";
import classes from "./ImageCard.module.css";
import { Image } from "../../../../../../Components/Image/Image";

interface Props {
  filepath: string;
  canDelete: boolean;
  percentile: number;
  numVotes: number;
  imageId: string;
  hasPlaceholder: boolean;
  availableWidths: number[];
  availableFormats: string[];
  isSvg: boolean;
  onClick: () => void;
}

export const ImageCard = ({
  filepath,
  canDelete,
  imageId,
  percentile,
  numVotes,
  availableWidths,
  hasPlaceholder,
  isSvg,
  onClick,
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
      confirmProps: { color: "red" },
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

  if (!filepath || filepath.trim() === "") {
    return null;
  }

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
      <Image
        filepath={filepath}
        availableWidths={availableWidths}
        hasPlaceholder={hasPlaceholder}
        isSvg={isSvg}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "pointer",
        }}
        sizes="(max-width: 599px) 100vw, (max-width: 799px) 49vw, (max-width: 1199px) 46vw, (max-width: 1499px) 31vw, (max-width: 1499px) 24vw, 450px"
        onClick={onClick}
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
        <Tooltip
          label={`Score: ${(percentile * 100).toFixed(1)}%`}
          events={{ hover: true, focus: false, touch: true }}
        >
          <Group gap={4} style={{ cursor: "pointer" }}>
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
        </Tooltip>

        <Tooltip
          label={`${numVotes} votes`}
          events={{ hover: true, focus: false, touch: true }}
        >
          <Group gap={4} style={{ cursor: "pointer" }}>
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
        </Tooltip>
      </Group>
      {canDelete && <div className={classes.overlayTop} />}
      <div className={classes.overlayBottom} />
    </div>
  );
};
