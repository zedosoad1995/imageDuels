import { useContext, useRef } from "react";
import { useParams } from "react-router";
import { addImageToCollection } from "../../../../Api/collections";
import imageCompression, { Options } from "browser-image-compression";
import { Button, Group, Text } from "@mantine/core";
import classes from "./Images.module.css";
import { IGetCollection } from "../../../../Types/collection";
import { notifications } from "@mantine/notifications";
import { CollectionContext } from "../../../../Contexts/CollectionContext";
import pLimit from "p-limit";
import { getImageURL } from "../../../../Utils/image";
import { MasonryGrid } from "../../../../Components/MasonryGrid/MasonryGrid";
import VotingIcon from "../../../../assets/svgs/ballot.svg?react";
import ScoreIcon from "../../../../assets/svgs/leaderboard.svg?react";

const limit = pLimit(2);

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
      files.map((file) =>
        limit(async () => {
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
      )
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

  // TODO: Open PR to solve gutter (it always puts 10px)

  return (
    <>
      <Button className={classes.uploadBtn} onClick={handleButtonClick}>
        Upload images
      </Button>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        style={{ display: "none" }}
        multiple
        accept=".jpg, .jpeg, .png, .webp"
      />

      <MasonryGrid numColumns={3} gap={4}>
        {collection.images.map(({ id, filepath, numVotes, percentile }) => (
          <div
            key={id}
            style={{ position: "relative", overflow: "auto", borderRadius: 6 }}
          >
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
            <div
              style={{
                position: "absolute",
                background: "linear-gradient(#00000000, #00000085)",
                top: "max(calc(100% - 80px), 0px)",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1,
              }}
            />
          </div>
        ))}
      </MasonryGrid>
    </>
  );
};
