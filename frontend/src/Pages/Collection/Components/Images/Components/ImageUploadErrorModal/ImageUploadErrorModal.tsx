import { Button, Grid, Modal, Stack } from "@mantine/core";
import { useMemo } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  failedImages: File[];
}

export const ImageUploadErrorModal = ({
  isOpen,
  onClose,
  onRetry,
  failedImages,
}: Props) => {
  const imgsBlob = useMemo(
    () => failedImages.map(URL.createObjectURL),
    [failedImages]
  );

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={`Failed to upload ${failedImages.length} images`}
      centered
      styles={{
        title: { fontWeight: 600 },
        content: { flex: "none" },
        body: { paddingBottom: 0 },
      }}
    >
      <Stack gap={0}>
        <Grid>
          {imgsBlob.map((image) => (
            <Grid.Col key={image} span={{ base: 6, xs: 4 }}>
              <img
                src={image}
                style={{
                  width: "100%",
                  objectFit: "cover",
                  aspectRatio: "1/1",
                }}
              />
            </Grid.Col>
          ))}
        </Grid>
        <div
          style={{
            paddingTop: "1rem",
            paddingBottom: "1rem",
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            zIndex: 1,
          }}
        >
          <Button onClick={onRetry}>Retry Upload</Button>
        </div>
      </Stack>
    </Modal>
  );
};
