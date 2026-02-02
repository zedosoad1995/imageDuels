import {
  Button,
  Card,
  Container,
  Flex,
  Group,
  Stack,
  Text,
  Title,
  Center,
} from "@mantine/core";
import { getDuel } from "../../../../Api/collections";
import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import classes from "./Vote.module.css";
import { vote, VoteOutcome } from "../../../../Api/duels";
import { IGetCollection, IGetDuel } from "../../../../Types/collection";
import { UserContext } from "../../../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { Image } from "../../../../Components/Image/Image";
import { useMediaQuery } from "@mantine/hooks";
import { MEDIA_QUERY_IS_MOBILE } from "../../../../Utils/breakpoints";

interface Props {
  collection: IGetCollection;
}

export const Vote = ({ collection }: Props) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MEDIA_QUERY_IS_MOBILE);

  const { id: collectionId } = useParams();
  const [image1, setImage1] = useState<IGetDuel["image1"]>();
  const [image2, setImage2] = useState<IGetDuel["image2"]>();
  const [token, setDuelToken] = useState<string>();
  const { loggedIn } = useContext(UserContext);

  useEffect(() => {
    if (!collectionId) {
      return;
    }

    getDuel(collectionId)
      .then(({ token, image1, image2 }) => {
        setImage1(image1);
        setImage2(image2);
        setDuelToken(token);
      })
      .catch(() => {
        // Handle error case - no more duels available
        setImage1(undefined);
        setImage2(undefined);
        setDuelToken(undefined);
      });
  }, [collectionId]);

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

      getDuel(collectionId)
        .then(({ token, image1, image2 }) => {
          setImage1(image1);
          setImage2(image2);
          setDuelToken(token);
        })
        .catch(() => {
          // Handle error case - no more duels available
          setImage1(undefined);
          setImage2(undefined);
          setDuelToken(undefined);
        });
    },
    [token, collectionId, loggedIn]
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

  // TODO: Display 2 images to vote when not logged in, but when user clicks, show modal to sign up

  const hasNoImages = !image1 || !image2;

  if (hasNoImages) {
    return (
      <Container
        size={"lg"}
        px={0}
        flex={1}
        display="flex"
        style={{
          flexDirection: "column",
          width: "100%",
          justifyContent: "center",
        }}
      >
        {collection.question && (
          <Text fw={600} size="lg" pb={8}>
            {collection.question}
          </Text>
        )}
        <Card withBorder bg="#FAFAFA" radius={12} style={{ width: "100%" }}>
          <Center
            style={{
              minHeight: isMobile ? "400px" : "500px",
              flexDirection: "column",
              gap: 16,
            }}
            p="xl"
          >
            <Title
              order={2}
              size={isMobile ? "h3" : "h2"}
              ta="center"
              c="dimmed"
            >
              All Caught Up!
            </Title>
            <Text
              size={isMobile ? "sm" : "md"}
              ta="center"
              c="dimmed"
              maw={400}
            >
              You've voted on all available image pairs in this collection.
              Check back later for more duels, or explore other collections!
            </Text>
          </Center>
        </Card>
      </Container>
    );
  }

  return (
    <Container
      size={"lg"}
      px={0}
      flex={1}
      display="flex"
      style={{ flexDirection: "column", width: "100%" }}
    >
      {collection.question && (
        <Text fw={600} size="lg" pb={8}>
          {collection.question}
        </Text>
      )}
      {isMobile && (
        <Stack gap={4} align="center" style={{ width: "100%", flex: 1 }}>
          <Card
            withBorder
            className={classes.imageCard}
            style={{ width: "100%" }}
            onClick={handleVote("WIN")}
            bg="#FAFAFA"
            radius={12}
          >
            <Card.Section
              withBorder
              style={{
                display: "flex",
                position: "relative",
                flex: 1,
              }}
            >
              <Image
                filepath={image1?.filepath ?? ""}
                availableWidths={image1?.availableWidths ?? []}
                hasPlaceholder={image1?.hasPlaceholder ?? false}
                isSvg={image1?.isSvg ?? false}
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
                objectFit="cover"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
              />
              <Image
                filepath={image1?.filepath ?? ""}
                availableWidths={image1?.availableWidths ?? []}
                hasPlaceholder={image1?.hasPlaceholder ?? false}
                isSvg={image1?.isSvg ?? false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  zIndex: 1,
                }}
                objectFit="contain"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
              />
            </Card.Section>
          </Card>
          <Card
            withBorder
            className={classes.imageCard}
            onClick={handleVote("LOSS")}
            style={{ width: "100%" }}
            bg="#FAFAFA"
            radius={12}
          >
            <Card.Section
              withBorder
              style={{
                display: "flex",
                position: "relative",
                flex: 1,
              }}
            >
              <Image
                filepath={image2?.filepath ?? ""}
                availableWidths={image2?.availableWidths ?? []}
                hasPlaceholder={image2?.hasPlaceholder ?? false}
                isSvg={image2?.isSvg ?? false}
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
                objectFit="cover"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
              />
              <Image
                filepath={image2?.filepath ?? ""}
                availableWidths={image2?.availableWidths ?? []}
                hasPlaceholder={image2?.hasPlaceholder ?? false}
                isSvg={image2?.isSvg ?? false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  zIndex: 1,
                }}
                objectFit="contain"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
              />
            </Card.Section>
          </Card>
        </Stack>
      )}
      {!isMobile && (
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
              <Image
                filepath={image1?.filepath ?? ""}
                availableWidths={image1?.availableWidths ?? []}
                hasPlaceholder={image1?.hasPlaceholder ?? false}
                isSvg={image1?.isSvg ?? false}
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
                objectFit="cover"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
              />
              <Image
                filepath={image1?.filepath ?? ""}
                availableWidths={image1?.availableWidths ?? []}
                hasPlaceholder={image1?.hasPlaceholder ?? false}
                isSvg={image1?.isSvg ?? false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  zIndex: 1,
                }}
                objectFit="contain"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
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
              <Image
                filepath={image2?.filepath ?? ""}
                availableWidths={image2?.availableWidths ?? []}
                hasPlaceholder={image2?.hasPlaceholder ?? false}
                isSvg={image2?.isSvg ?? false}
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
                objectFit="cover"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
              />
              <Image
                filepath={image2?.filepath ?? ""}
                availableWidths={image2?.availableWidths ?? []}
                hasPlaceholder={image2?.hasPlaceholder ?? false}
                isSvg={image2?.isSvg ?? false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  zIndex: 1,
                }}
                objectFit="contain"
                sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
              />
            </Card.Section>
          </Card>
        </Flex>
      )}
      {!hasNoImages && (
        <Group mt={isMobile ? 4 : 8} justify="center">
          <Button variant="outline" px={64} onClick={handleVote("SKIP")}>
            Skip
          </Button>
        </Group>
      )}
    </Container>
  );
};
