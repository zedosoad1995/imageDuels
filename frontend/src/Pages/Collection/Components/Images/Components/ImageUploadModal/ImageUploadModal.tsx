import { Modal, RingProgress, Text } from "@mantine/core";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  numUploadedImages: number;
  totalImages: number;
}

export const ImageUploadModal = ({
  isOpen,
  onClose,
  numUploadedImages,
  totalImages,
}: Props) => {
  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Uploading...`}
      centered
      size="xs"
      styles={{ title: { fontWeight: 600 }, content: { flex: "none" } }}
    >
      <RingProgress
        sections={[
          {
            value:
              totalImages > 0 ? (numUploadedImages / totalImages) * 100 : 0,
            color: "blue",
          },
        ]}
        label={
          <Text c="blue" fw={700} ta="center" size="28px">
            {numUploadedImages}/{totalImages}
          </Text>
        }
        size={208}
        thickness={16}
        transitionDuration={100}
        style={{ margin: "auto" }}
        roundCaps
      />
    </Modal>
  );
};
