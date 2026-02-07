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
  Checkbox,
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
  const [winnerImage, setWinnerImage] = useState<"image1" | "image2">();
  const [isProcessingVote, setIsProcessingVote] = useState(false);
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

      if (isProcessingVote) {
        return;
      }

      if (outcome !== "SKIP") {
        await vote(token, outcome);
      }

      setWinnerImage(outcome === "WIN" ? "image1" : "image2");

      setIsProcessingVote(true);
      await new Promise((promise) => setTimeout(promise, 1000));

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
        })
        .finally(() => {
          setIsProcessingVote(false);
          setWinnerImage(undefined);
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
      <Text fw={600} size="lg" pb={8}>
        {collection.question || "Which image is better?"}
      </Text>
      {isMobile && (
        <Stack gap={4} align="center" style={{ width: "100%", flex: 1 }}>
          <Card
            withBorder
            className={classes.imageCard}
            style={{
              width: "100%",
              boxShadow:
                isProcessingVote && winnerImage === "image1"
                  ? "0 0 6px 4px rgba(0, 0, 0, 0.5)"
                  : undefined,
            }}
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
              {isProcessingVote && (
                <>
                  {winnerImage === "image1" && (
                    <Checkbox
                      radius="xl"
                      checked
                      variant="filled"
                      size="md"
                      style={{
                        position: "absolute",
                        zIndex: 100,
                        left: "10px",
                        top: "10px",
                      }}
                      styles={{
                        input: {
                          backgroundColor: "#fff",
                          border: 0,
                        },
                        icon: {
                          color: "#000",
                        },
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#00000060",
                      zIndex: 99,
                    }}
                  ></div>
                  {image1.winProb !== undefined && (
                    <p
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translateX(-50%) translateY(-50%)",
                        color: "white",
                        fontSize: isMobile ? 60 : 100,
                        fontWeight: 600,
                        zIndex: 100,
                        margin: 0,
                      }}
                    >
                      {(image1.winProb * 100).toFixed(1)}
                      <span
                        style={{
                          fontSize: isMobile ? 30 : 50,
                        }}
                      >
                        %
                      </span>
                    </p>
                  )}
                </>
              )}

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
            style={{
              width: "100%",
              boxShadow:
                isProcessingVote && winnerImage === "image2"
                  ? "0 0 6px 4px rgba(0, 0, 0, 0.5)"
                  : undefined,
            }}
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
              {isProcessingVote && (
                <>
                  {winnerImage === "image2" && (
                    <Checkbox
                      radius="xl"
                      checked
                      variant="filled"
                      size="md"
                      style={{
                        position: "absolute",
                        zIndex: 100,
                        left: "10px",
                        top: "10px",
                      }}
                      styles={{
                        input: {
                          backgroundColor: "#fff",
                          border: 0,
                        },
                        icon: {
                          color: "#000",
                        },
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#00000060",
                      zIndex: 99,
                    }}
                  ></div>
                  {image2.winProb !== undefined && (
                    <p
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translateX(-50%) translateY(-50%)",
                        color: "white",
                        fontSize: isMobile ? 60 : 100,
                        fontWeight: 600,
                        zIndex: 100,
                        margin: 0,
                      }}
                    >
                      {(image2.winProb * 100).toFixed(1)}
                      <span
                        style={{
                          fontSize: isMobile ? 30 : 50,
                        }}
                      >
                        %
                      </span>
                    </p>
                  )}
                </>
              )}

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
            style={{
              boxShadow:
                isProcessingVote && winnerImage === "image2"
                  ? "0 0 6px 4px rgba(0, 0, 0, 0.5)"
                  : undefined,
            }}
          >
            <Card.Section
              withBorder
              style={{
                display: "flex",
                aspectRatio: "1 / 1",
                position: "relative",
              }}
            >
              {isProcessingVote && (
                <>
                  {winnerImage === "image1" && (
                    <Checkbox
                      radius="xl"
                      checked
                      variant="filled"
                      size="lg"
                      style={{
                        position: "absolute",
                        zIndex: 100,
                        left: "15px",
                        top: "15px",
                      }}
                      styles={{
                        input: {
                          backgroundColor: "#fff",
                          border: 0,
                        },
                        icon: {
                          color: "#000",
                        },
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#00000060",
                      zIndex: 99,
                    }}
                  ></div>
                  {image1.winProb !== undefined && (
                    <p
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translateX(-50%) translateY(-50%)",
                        color: "white",
                        fontSize: isMobile ? 60 : 100,
                        fontWeight: 600,
                        zIndex: 100,
                        margin: 0,
                      }}
                    >
                      {(image1.winProb * 100).toFixed(1)}
                      <span
                        style={{
                          fontSize: isMobile ? 30 : 50,
                        }}
                      >
                        %
                      </span>
                    </p>
                  )}
                </>
              )}

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
            style={{
              boxShadow:
                isProcessingVote && winnerImage === "image2"
                  ? "0 0 6px 4px rgba(0, 0, 0, 0.5)"
                  : undefined,
            }}
          >
            <Card.Section
              withBorder
              style={{
                display: "flex",
                aspectRatio: "1 / 1",
                position: "relative",
              }}
            >
              {isProcessingVote && (
                <>
                  {winnerImage === "image2" && (
                    <Checkbox
                      radius="xl"
                      checked
                      variant="filled"
                      size="lg"
                      style={{
                        position: "absolute",
                        zIndex: 100,
                        left: "15px",
                        top: "15px",
                      }}
                      styles={{
                        input: {
                          backgroundColor: "#fff",
                          border: 0,
                        },
                        icon: {
                          color: "#000",
                        },
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#00000060",
                      zIndex: 99,
                    }}
                  ></div>
                  {image2.winProb !== undefined && (
                    <p
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translateX(-50%) translateY(-50%)",
                        color: "white",
                        fontSize: isMobile ? 60 : 100,
                        fontWeight: 600,
                        zIndex: 100,
                        margin: 0,
                      }}
                    >
                      {(image2.winProb * 100).toFixed(1)}
                      <span
                        style={{
                          fontSize: isMobile ? 30 : 50,
                        }}
                      >
                        %
                      </span>
                    </p>
                  )}
                </>
              )}

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
