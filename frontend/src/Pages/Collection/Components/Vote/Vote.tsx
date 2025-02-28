import { Card, Flex, Text } from "@mantine/core";
import { createDuel, ICollection } from "../../../../Api/collections";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import classes from "./Vote.module.css";
import { getImageURL } from "../../../../Utils/image";
import { vote, VoteOutcome } from "../../../../Api/duels";

interface Props {
  collection: ICollection;
}

export const Vote = ({ collection }: Props) => {
  const { id } = useParams();
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [duelId, setDuelId] = useState<string>();

  useEffect(() => {
    if (!id) {
      return;
    }

    createDuel(id).then(({ duelId, image1, image2 }) => {
      setImage1(image1);
      setImage2(image2);
      setDuelId(duelId);
    });
  }, []);

  const handleVote = (outcome: VoteOutcome) => async () => {
    if (!duelId || !id) {
      return;
    }

    await vote(duelId, outcome);

    createDuel(id).then(({ duelId, image1, image2 }) => {
      setImage1(image1);
      setImage2(image2);
      setDuelId(duelId);
    });
  };

  return (
    <>
      {collection.question && (
        <Text fw={600} size="lg" pb={8}>
          {collection.question}
        </Text>
      )}
      <Flex gap={8}>
        <Card
          withBorder
          className={classes.imageCard}
          onClick={handleVote("WIN")}
        >
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
        <Card
          withBorder
          className={classes.imageCard}
          onClick={handleVote("LOSS")}
        >
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
