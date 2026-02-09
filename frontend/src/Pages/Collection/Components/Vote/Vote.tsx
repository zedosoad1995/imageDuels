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
  Skeleton,
} from "@mantine/core";
import { getDuel } from "../../../../Api/collections";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import classes from "./Vote.module.css";
import { vote, VoteOutcome } from "../../../../Api/duels";
import { IGetCollection, IGetDuel } from "../../../../Types/collection";
import { UserContext } from "../../../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { Image } from "../../../../Components/Image/Image";
import { useMediaQuery } from "@mantine/hooks";
import { MEDIA_QUERY_IS_MOBILE } from "../../../../Utils/breakpoints";

const VOTE_ANIMATION_TIME = 500;

interface Props {
  collection: IGetCollection;
}

export const Vote = ({ collection }: Props) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MEDIA_QUERY_IS_MOBILE);

  const { id: collectionId } = useParams();
  const [image1, setImage1] = useState<IGetDuel["image1"]>();
  const [image2, setImage2] = useState<IGetDuel["image2"]>();
  const [nextImage1, setNextImage1] = useState<IGetDuel["image1"]>();
  const [nextImage2, setNextImage2] = useState<IGetDuel["image2"]>();
  const [duelToken, setDuelToken] = useState<string>();
  const [winnerImage, setWinnerImage] = useState<"image1" | "image2">();
  const [isProcessingVote, setIsProcessingVote] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { loggedIn } = useContext(UserContext);

  const nextSwapRef = useRef<{
    token?: string;
    image1?: IGetDuel["image1"];
    image2?: IGetDuel["image1"];
  }>({});

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
      })
      .finally(() => {
        setHasLoaded(true);
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

      if (!duelToken || !collectionId) {
        return;
      }

      if (isProcessingVote) {
        return;
      }

      if (outcome === "SKIP") {
        return;
      }

      setIsProcessingVote(true);
      setWinnerImage(outcome === "WIN" ? "image1" : "image2");

      const timerP = new Promise<void>((r) =>
        setTimeout(r, VOTE_ANIMATION_TIME)
      );

      const fetchP = vote(duelToken, outcome).then(() =>
        getDuel(collectionId)
          .then(({ token, image1, image2 }) => {
            nextSwapRef.current = { token, image1, image2 };

            setNextImage1(image1);
            setNextImage2(image2);
            setDuelToken(token);
          })
          .catch(() => {
            nextSwapRef.current = {
              token: undefined,
              image1: undefined,
              image2: undefined,
            };
            setNextImage1(undefined);
            setNextImage2(undefined);
            setDuelToken(undefined);
          })
      );

      Promise.all([timerP, fetchP])
        .then(() => {
          const { token, image1, image2 } = nextSwapRef.current;

          setImage1(image1);
          setImage2(image2);
          setDuelToken(token);
        })
        .finally(() => {
          setNextImage1(undefined);
          setNextImage2(undefined);
          setWinnerImage(undefined);
          setIsProcessingVote(false);
        });
    },
    [duelToken, collectionId, loggedIn, isProcessingVote]
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

  if (!hasLoaded) {
    return (
      <Container
        size={"lg"}
        px={0}
        flex={1}
        display="flex"
        style={{ flexDirection: "column", width: "100%" }}
      >
        <Skeleton height={28} width={200} mb={8} />
        {isMobile ? (
          <Stack gap={4} align="center" style={{ width: "100%", flex: 1 }}>
            <Card withBorder bg="#FAFAFA" radius={12} style={{ width: "100%" }}>
              <Card.Section
                withBorder
                style={{
                  display: "flex",
                  position: "relative",
                  minHeight: "400px",
                }}
              >
                <Skeleton height="100%" width="100%" />
              </Card.Section>
            </Card>
            <Card withBorder bg="#FAFAFA" radius={12} style={{ width: "100%" }}>
              <Card.Section
                withBorder
                style={{
                  display: "flex",
                  position: "relative",
                  minHeight: "400px",
                }}
              >
                <Skeleton height="100%" width="100%" />
              </Card.Section>
            </Card>
          </Stack>
        ) : (
          <Flex gap={8}>
            <Card withBorder bg="#FAFAFA" radius={12} style={{ flex: 1 }}>
              <Card.Section
                withBorder
                style={{
                  display: "flex",
                  aspectRatio: "1 / 1",
                  position: "relative",
                }}
              >
                <Skeleton height="100%" width="100%" />
              </Card.Section>
            </Card>
            <Card withBorder bg="#FAFAFA" radius={12} style={{ flex: 1 }}>
              <Card.Section
                withBorder
                style={{
                  display: "flex",
                  aspectRatio: "1 / 1",
                  position: "relative",
                }}
              >
                <Skeleton height="100%" width="100%" />
              </Card.Section>
            </Card>
          </Flex>
        )}
        <Group mt={isMobile ? 4 : 8} justify="center">
          <Skeleton height={36} width={128} />
        </Group>
      </Container>
    );
  }

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
                      readOnly
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
              {nextImage1 && (
                <Image
                  filepath={nextImage1?.filepath ?? ""}
                  availableWidths={nextImage1?.availableWidths ?? []}
                  hasPlaceholder={nextImage1?.hasPlaceholder ?? false}
                  isSvg={nextImage1?.isSvg ?? false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    zIndex: 1,
                    visibility: "hidden",
                  }}
                  objectFit="contain"
                  sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
                />
              )}
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
                      readOnly
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
              {nextImage2 && (
                <Image
                  filepath={nextImage2?.filepath ?? ""}
                  availableWidths={nextImage2?.availableWidths ?? []}
                  hasPlaceholder={nextImage2?.hasPlaceholder ?? false}
                  isSvg={nextImage2?.isSvg ?? false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    zIndex: 1,
                    visibility: "hidden",
                  }}
                  objectFit="contain"
                  sizes="(max-width: 799px) 47vw, (max-width: 1240px) 43vw, 550px"
                />
              )}
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
                      readOnly
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
                sizes="100vw"
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
                sizes="100vw"
              />
              {nextImage1 && (
                <Image
                  filepath={nextImage1?.filepath ?? ""}
                  availableWidths={nextImage1?.availableWidths ?? []}
                  hasPlaceholder={nextImage1?.hasPlaceholder ?? false}
                  isSvg={nextImage1?.isSvg ?? false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    zIndex: 1,
                    visibility: "hidden",
                  }}
                  objectFit="contain"
                  sizes="100vw"
                />
              )}
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
                      readOnly
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
                sizes="100vw"
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
                sizes="100vw"
              />
              {nextImage2 && (
                <Image
                  filepath={nextImage2?.filepath ?? ""}
                  availableWidths={nextImage2?.availableWidths ?? []}
                  hasPlaceholder={nextImage2?.hasPlaceholder ?? false}
                  isSvg={nextImage2?.isSvg ?? false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    zIndex: 1,
                    visibility: "hidden",
                  }}
                  objectFit="contain"
                  sizes="100vw"
                />
              )}
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
