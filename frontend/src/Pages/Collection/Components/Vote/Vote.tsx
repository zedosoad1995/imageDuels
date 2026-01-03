import { Button, Card, Container, Flex, Group, Text } from "@mantine/core";
import { getDuel } from "../../../../Api/collections";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import classes from "./Vote.module.css";
import { vote, VoteOutcome } from "../../../../Api/duels";
import { IGetCollection } from "../../../../Types/collection";
import { UserContext } from "../../../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { getImageURL } from "../../../../Utils/image";

interface Props {
  collection: IGetCollection;
}

export const Vote = ({ collection }: Props) => {
  const navigate = useNavigate();

  const { id: collectionId } = useParams();
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [token, setDuelToken] = useState<string>();
  const { loggedIn } = useContext(UserContext);

  useEffect(() => {
    if (!collectionId) {
      return;
    }

    getDuel(collectionId).then(({ token, image1, image2 }) => {
      setImage1(image1);
      setImage2(image2);
      setDuelToken(token);
    });
  }, []);

  const openSignUpModal = () =>
    modals.openConfirmModal({
      title: "Create Account",
      centered: true,
      children: <Text size="sm">You cannot vote without an account.</Text>,
      labels: { confirm: "Create Account", cancel: "Cancel" },
      confirmProps: { color: "blue" },
      onConfirm: () => {
        navigate("/register");
      },
    });

  const handleVote = useCallback(
    (outcome: VoteOutcome) => async () => {
      if (!loggedIn) {
        openSignUpModal();
      }

      if (!token || !collectionId) {
        return;
      }

      if (outcome !== "SKIP") {
        await vote(token, outcome);
      }

      getDuel(collectionId).then(({ token, image1, image2 }) => {
        setImage1(image1);
        setImage2(image2);
        setDuelToken(token);
      });
    },
    [token, collectionId]
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
    <Container size={"lg"}>
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
          bg="#FAFAFA"
          radius={12}
        >
          <Card.Section
            withBorder
            style={{
              display: "flex",
              aspectRatio: "1 / 1",
              position: "relative",
            }}
          >
            <img
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(40px) brightness(1.2)",
                opacity: 0.4,
                transform: "scale(1.1)",
              }}
              src={getImageURL(image1)}
            />
            <img
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                zIndex: 1,
              }}
              src={getImageURL(image1)}
            />
          </Card.Section>
        </Card>
        <Card
          withBorder
          className={classes.imageCard}
          onClick={handleVote("LOSS")}
          bg="#FAFAFA"
          radius={12}
        >
          <Card.Section
            withBorder
            style={{
              display: "flex",
              aspectRatio: "1 / 1",
              position: "relative",
            }}
          >
            <img
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(40px) brightness(1.2)",
                opacity: 0.4,
                transform: "scale(1.1)",
              }}
              src={getImageURL(image2)}
            />
            <img
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                zIndex: 1,
              }}
              src={getImageURL(image2)}
            />
          </Card.Section>
        </Card>
      </Flex>
      <Group mt={8} justify="center">
        <Button variant="outline" px={64} onClick={handleVote("SKIP")}>
          Skip
        </Button>
      </Group>
    </Container>
  );
};
