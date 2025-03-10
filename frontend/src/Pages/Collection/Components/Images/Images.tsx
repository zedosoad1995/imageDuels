import { useContext, useRef } from "react";
import { useParams } from "react-router";
import { addImageToCollection } from "../../../../Api/collections";
import imageCompression, { Options } from "browser-image-compression";
import { Button, Card, Grid, Group, Progress, Text } from "@mantine/core";
import classes from "./Images.module.css";
import { IGetCollection } from "../../../../Types/collection";
import { notifications } from "@mantine/notifications";
import { Image } from "../../../../Components/Image/Image";
import { CollectionContext } from "../../../../Contexts/CollectionContext";
import { getImageURL, isImageValid } from "../../../../Utils/image";

interface Props {
  collection: IGetCollection;
}

export const Images = ({ collection }: Props) => {
  const { id } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const { fetchCollection } = useContext(CollectionContext);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !id) return;

    const files = Array.from(e.target.files);

    // TODO: Improve this, maybe allow to reload or repeat, look for efficiency, test a lot, etc.
    // TODO: limit number of files that can be uploaded (151), also be aware of how many files there are already, but the real validation should be in the backend
    // TODO: Should it update only at the end, or progressively?

    const res = await Promise.allSettled(
      files.map(async (file) => {
        if (file.size > 1 * 1024 * 1024) {
          const options: Options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          file = await imageCompression(file, options);
        }

        return addImageToCollection(id, file);
      })
    );

    fetchCollection();

    const { numSuccess, numFailures } = res.reduce(
      (acc, val) => {
        if (val.status === "fulfilled") {
          acc.numSuccess += 1;
        } else {
          acc.numFailures += 1;
        }

        return acc;
      },
      { numSuccess: 0, numFailures: 0 }
    );

    if (numSuccess + numFailures === 0) return;

    if (numSuccess + numFailures === 1) {
      if (numSuccess) {
        return notifications.show({
          message: "Image successfully uploaded",
        });
      }

      return notifications.show({
        message: "Image could not be uploaded",
        color: "red",
      });
    }

    if (numFailures > 0) {
      return notifications.show({
        message: `${numSuccess}/${
          numSuccess + numFailures
        } images were uploaded (${numFailures} images failed to upload)`,
        color: "red",
      });
    }

    notifications.show({
      message: `All ${numSuccess} images successfully uploaded`,
    });
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <>
      <Button onClick={handleButtonClick}>Upload image</Button>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        style={{ display: "none" }}
        multiple
        accept=".jpg, .jpeg, .png, .webp"
      />
      <Grid pt="xs">
        {collection.images.map(({ id, filepath, numVotes, percentile }) => (
          <Grid.Col key={id} span={{ base: 12, xs: 6, sm: 4, lg: 3 }}>
            <Card withBorder className={classes.card} pb={0}>
              <Card.Section withBorder style={{ textAlign: "center" }}>
                <Image filepath={filepath} />
              </Card.Section>
              <div className={classes.cardInfo}>
                <Group justify="space-between">
                  <Text size="sm">
                    <Text fw={600} span>
                      {numVotes}
                    </Text>{" "}
                    votes
                  </Text>
                  <Text size="sm">{Math.round(percentile * 100)}%</Text>
                </Group>
                <Progress value={percentile * 100} animated />
              </div>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
};
