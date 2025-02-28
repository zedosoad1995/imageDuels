import { Card, Flex, Text } from "@mantine/core";
import { createDuel, ICollection } from "../../../../Api/collections";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import classes from "./Vote.module.css";
import { getImageURL } from "../../../../Utils/image";

interface Props {
  collection: ICollection;
}

export const Vote = ({ collection }: Props) => {
  const { id } = useParams();
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    createDuel(id).then(({ image1, image2 }) => {
      setImage1(image1);
      setImage2(image2);
    });
  }, []);

  return (
    <>
      {collection.question && (
        <Text fw={600} size="lg" pb={8}>
          {collection.question}
        </Text>
      )}
      <Flex gap={8}>
        <Card withBorder className={classes.card}>
          <Card.Section withBorder style={{ textAlign: "center" }}>
            <div
              style={{
                backgroundImage: `url(${getImageURL(image1)})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "center",
                width: "100%",
                paddingTop: "100%",
              }}
            />
          </Card.Section>
        </Card>
        <Card withBorder className={classes.card}>
          <Card.Section withBorder style={{ textAlign: "center" }}>
            <div
              style={{
                backgroundImage: `url(${getImageURL(image2)})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                backgroundPosition: "center",
                width: "100%",
                paddingTop: "100%",
              }}
            />
          </Card.Section>
        </Card>
      </Flex>
    </>
  );
};
