import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { feed, vote, VoteOutcome } from "../../Api/duels";
import {
  Button,
  Card,
  Divider,
  Flex,
  Kbd,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import classes from "./Feed.module.css";
import { UserContext } from "../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { useNavigate, useLocation } from "react-router";
import { getDuel } from "../../Api/collections";
import { useMediaQuery } from "@mantine/hooks";
import { usePage } from "../../Hooks/usePage";
import {
  MEDIA_QUERY_DESKTOP,
  MEDIA_QUERY_TABLET,
} from "../../Utils/breakpoints";
import { useInfiniteScroll } from "../../Hooks/useInfiniteScroll";
import { Image } from "../../Components/Image/Image";
import DownArrowIcon from "../../assets/svgs/arrow-down.svg?react";
import { DuelKeyboardHint } from "../../Components/KeyboardHints/KeyboardHints";
import { useReelsPaging } from "../../Hooks/useReelsPaging";

const MAX_WIDTH = 1400;

export const Feed = () => {
  const { loggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  usePage("feed");
  const isLaptopOrTablet = useMediaQuery(MEDIA_QUERY_TABLET);

  const feedRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  const [duels, setDuels] = useState<
    | {
        token: string | undefined;
        image1: {
          filepath: string;
          hasPlaceholder: boolean;
          availableWidths: number[];
          availableFormats: string[];
          isSvg: boolean;
        };
        image2: {
          filepath: string;
          hasPlaceholder: boolean;
          availableWidths: number[];
          availableFormats: string[];
          isSvg: boolean;
        };
        collectionId: string;
        collectionName: string;
      }[]
    | null
  >(null);
  const [cursor, setCursor] = useState<string | null | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollToIndex } = useReelsPaging({
    feedRef,
    itemRefs,
    count: duels?.length ?? 0,
    onIndexChange: setActiveIndex,
  });

  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(cursor),
    isLoading,
    onLoadMore: () => {
      setIsLoading(true);
      feed(cursor)
        .then(({ duels, nextCursor }) => {
          setDuels((val) => (val ? [...val, ...duels] : null));
          setCursor(nextCursor);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    rootMargin: "2000px",
  });

  useEffect(() => {
    feed().then(({ duels, nextCursor }) => {
      setDuels(duels);
      setCursor(nextCursor);
    });
  }, []);

  const handleClickCollection = (collectionId: string) => () => {
    navigate(`/collections/${collectionId}`, {
      state: { from: location.pathname },
    });
  };

  const handleVote =
    (
      outcome: VoteOutcome,
      token: string | undefined,
      collectionId: string,
      index: number
    ) =>
    async (event: React.MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();

      if (!loggedIn) {
        openSignUpModal();
        return;
      }

      if (!token) {
        return;
      }

      await vote(token, outcome);

      setHasVoted(true);

      getDuel(collectionId).then(({ token, image1, image2 }) => {
        setDuels((duels) => {
          if (!duels) return duels;

          return duels.map((duel, indexMap) =>
            index === indexMap
              ? {
                  token,
                  image1,
                  image2,
                  collectionId,
                  collectionName: duel.collectionName,
                }
              : duel
          );
        });
      });
    };

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

  const verticalPadding = isLaptopOrTablet ? 32 : 24;
  const isDesktop = useMediaQuery(MEDIA_QUERY_DESKTOP);

  return (
    <>
      {/* {isDesktop && (
        <Title order={2} pb="sm" maw={MAX_WIDTH} mx="auto">
          Duels
        </Title>
      )} */}
      <div
        ref={feedRef}
        tabIndex={0}
        style={{
          height: "100vh",
          overflowY: "auto",
          marginTop: -50,
          marginBottom: -48,
        }}
        className={classes.hideScrollbar}
      >
        {duels?.map(
          ({ image1, image2, token, collectionId, collectionName }, index) => (
            <div
              key={index}
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: 16,
              }}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={classes.feedEl}
            >
              <div>
                <div
                  style={{
                    marginBottom:
                      index === duels.length - 1 ? 0 : verticalPadding,
                    marginTop: verticalPadding / 2,
                    maxWidth: 1400,
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <Flex justify={"center"} mb={20}>
                    <Button
                      variant="light"
                      color="gray"
                      radius="xl"
                      size="md"
                      onClick={handleClickCollection(collectionId)}
                    >
                      {collectionName}
                    </Button>
                  </Flex>
                  <Flex gap={8}>
                    <Card
                      withBorder
                      className={classes.imageCard}
                      onClick={handleVote("WIN", token, collectionId, index)}
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
                          {...image1}
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
                          sizes="(max-width: 799px) 50vw, (max-width: 1500px) 46vw, 700px"
                        />
                        <Image
                          {...image1}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            zIndex: 1,
                          }}
                          objectFit="contain"
                          sizes="(max-width: 799px) 50vw, (max-width: 1500px) 46vw, 700px"
                        />
                      </Card.Section>
                    </Card>
                    <Card
                      withBorder
                      className={classes.imageCard}
                      onClick={handleVote("LOSS", token, collectionId, index)}
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
                          {...image2}
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
                          sizes="(max-width: 799px) 50vw, (max-width: 1500px) 46vw, 700px"
                        />
                        <Image
                          {...image2}
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            zIndex: 1,
                          }}
                          objectFit="contain"
                          sizes="(max-width: 799px) 50vw, (max-width: 1500px) 46vw, 700px"
                        />
                      </Card.Section>
                    </Card>
                  </Flex>
                  <Flex justify={"center"} direction={"column"} gap={0} mt={18}>
                    <Button
                      variant="transparent"
                      color="gray"
                      mx={"auto"}
                      radius={"xl"}
                      onClick={() => {
                        scrollToIndex(activeIndex + 1);
                      }}
                    >
                      <Flex justify={"center"} align={"center"} gap={4}>
                        <Text>Next Duel</Text>
                        <DownArrowIcon height={14} width={14} />
                      </Flex>
                    </Button>
                  </Flex>
                </div>
              </div>
              <DuelKeyboardHint hasVoted={hasVoted} autoHideMs={10000} />
            </div>
          )
        )}

        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </>
  );
};
