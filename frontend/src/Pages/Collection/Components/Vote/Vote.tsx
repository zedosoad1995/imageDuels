import { Button, Card, Flex, Group, Text } from "@mantine/core";
import { createDuel } from "../../../../Api/collections";
import { useCallback, useContext, useEffect, useState } from "react";
import { useParams } from "react-router";
import classes from "./Vote.module.css";
import { vote, VoteOutcome } from "../../../../Api/duels";
import { IGetCollection } from "../../../../Types/collection";
import { Image } from "../../../../Components/Image/Image";
import { UserContext } from "../../../../Contexts/UserContext";

interface Props {
  collection: IGetCollection;
}

export const Vote = ({ collection }: Props) => {
  const { id } = useParams();
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [duelId, setDuelId] = useState<string>();
  const { loggedIn } = useContext(UserContext);

  useEffect(() => {
    if (!id || !loggedIn) {
      return;
    }

    createDuel(id).then(({ duelId, image1, image2 }) => {
      setImage1(image1);
      setImage2(image2);
      setDuelId(duelId);
    });
  }, []);

  const handleVote = useCallback(
    (outcome: VoteOutcome) => async () => {
      if (!duelId || !id) {
        return;
      }

      await vote(duelId, outcome);

      createDuel(id).then(({ duelId, image1, image2 }) => {
        setImage1(image1);
        setImage2(image2);
        setDuelId(duelId);
      });
    },
    [duelId, id]
  );

  useEffect(() => {
    if (!loggedIn) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        await handleVote("WIN")();
      } else if (event.key === "ArrowRight") {
        await handleVote("LOSS")();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleVote]);

  // TODO: Create placeholder when there aren't enough images (less than 2), or for other cases (e.g votes ran out)
  // TODO: Display 2 images to vote when not logged in, but when user clicks, show modal to sign up

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
            <Image filepath={image1} />
          </Card.Section>
        </Card>
        <Card
          withBorder
          className={classes.imageCard}
          onClick={handleVote("LOSS")}
        >
          <Card.Section withBorder style={{ textAlign: "center" }}>
            <Image filepath={image2} />
          </Card.Section>
        </Card>
      </Flex>
      <Group mt={8} justify="center">
        <Button variant="outline" px={64} onClick={handleVote("SKIP")}>
          Skip
        </Button>
      </Group>
    </>
  );
};
