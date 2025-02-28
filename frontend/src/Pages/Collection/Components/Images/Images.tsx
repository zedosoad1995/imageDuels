import { useRef } from "react";
import { useParams } from "react-router";
import { addImageToCollection, ICollection } from "../../../../Api/collections";
import imageCompression, { Options } from "browser-image-compression";
import { Button, Card, Grid, Text } from "@mantine/core";
import classes from "./Images.module.css";
import { getImageURL } from "../../../../Utils/image";

interface Props {
  collection: ICollection;
}

export const Images = ({ collection }: Props) => {
  const { id } = useParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !id) return;
    let file = e.target.files[0];

    if (file.size > 1 * 1024 * 1024) {
      const options: Options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      file = await imageCompression(file, options);
    }

    await addImageToCollection(id, file);
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
        accept=".jpg, .jpeg, .png, .webp"
      />
      <Grid pt="xs">
        {collection.images.map(({ id, filepath, numVotes }) => (
          <Grid.Col key={id} span={{ base: 12, xs: 6, sm: 4, lg: 3 }}>
            <Card withBorder className={classes.card}>
              <Card.Section withBorder style={{ textAlign: "center" }}>
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
              </Card.Section>
              <div className={classes.cardInfo}>
                <Text>
                  <Text fw={600} span>
                    {numVotes}
                  </Text>{" "}
                  votes
                </Text>
              </div>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
};
