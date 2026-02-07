import { useContext, useEffect, useRef, useState } from "react";
import { feed, vote, VoteOutcome } from "../../Api/duels";
import { Button, Flex, Text, Checkbox } from "@mantine/core";
import classes from "./Feed.module.css";
import { UserContext } from "../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { useNavigate, useLocation } from "react-router";
import { useMediaQuery } from "@mantine/hooks";
import { usePage } from "../../Hooks/usePage";
import { MEDIA_QUERY_DESKTOP } from "../../Utils/breakpoints";
import DownArrowIcon from "../../assets/svgs/arrow-down.svg?react";
import { DuelKeyboardHint } from "../../Components/KeyboardHints/KeyboardHints";
import { useReelsPaging } from "../../Hooks/useReelsPaging";
import { VoteCards } from "./Components/VoteCards/VoteCards";

export const Feed = () => {
  const { loggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  usePage("feed");
  const isLaptopOrTablet = useMediaQuery(MEDIA_QUERY_DESKTOP);

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
          winProb?: number;
        };
        image2: {
          filepath: string;
          hasPlaceholder: boolean;
          availableWidths: number[];
          availableFormats: string[];
          isSvg: boolean;
          winProb?: number;
        };
        collectionId: string;
        collectionName: string;
        collectionQuestion?: string;
      }[]
    | null
  >(null);
  const [cursor, setCursor] = useState<string | null | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isProcessingVote, setIsProcessingVote] = useState(false);
  const [winnerImage, setWinnerImage] = useState<"image1" | "image2">();

  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollToIndex, isLoading: isLoadingNextPage } = useReelsPaging({
    feedRef,
    itemRefs,
    count: duels?.length ?? 0,
    onIndexChange: setActiveIndex,
  });

  useEffect(() => {
    if (isLoading || !duels?.length || activeIndex !== duels.length - 2) {
      return;
    }

    setIsLoading(true);
    feed(cursor)
      .then(({ duels, nextCursor }) => {
        setDuels((val) => (val ? [...val, ...duels] : null));
        setCursor(nextCursor);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [duels, activeIndex]);

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
    (outcome: VoteOutcome, token: string | undefined) =>
    async (event?: React.MouseEvent<HTMLDivElement>) => {
      event?.stopPropagation();

      if (!loggedIn) {
        openSignUpModal();
        return;
      }

      if (!token) {
        return;
      }

      if (isProcessingVote) {
        return;
      }

      setWinnerImage(outcome === "WIN" ? "image1" : "image2");
      setIsProcessingVote(true);

      await vote(token, outcome);

      setHasVoted(true);

      await new Promise((promise) => setTimeout(promise, 1000));

      setIsProcessingVote(false);
      setWinnerImage(undefined);

      scrollToIndex(activeIndex + 1);
    };

  useEffect(() => {
    if (!loggedIn) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (!duels || isLoadingNextPage()) return;

      if (event.key === "ArrowLeft") {
        await handleVote("WIN", duels[activeIndex].token)();
      } else if (event.key === "ArrowRight") {
        await handleVote("LOSS", duels[activeIndex].token)();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleVote]);

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
          marginTop: isLaptopOrTablet ? 0 : -50,
          marginBottom: isLaptopOrTablet ? 0 : -48,
        }}
        className={classes.hideScrollbar}
      >
        {duels?.map(
          (
            {
              image1,
              image2,
              token,
              collectionId,
              collectionName,
              collectionQuestion,
            },
            index
          ) => (
            <div
              key={index}
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingTop: isLaptopOrTablet ? 0 : 50,
                paddingBottom: isLaptopOrTablet ? 0 : 48,
              }}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={classes.feedEl}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  paddingLeft: isLaptopOrTablet ? 16 : 8,
                  paddingRight: isLaptopOrTablet ? 16 : 8,
                  paddingTop: isLaptopOrTablet ? 16 : 0,
                  paddingBottom: isLaptopOrTablet ? 16 : 0,
                }}
              >
                <div
                  style={{
                    maxWidth: 1400,
                    marginLeft: "auto",
                    marginRight: "auto",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    width: "100%",
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
                  <Text
                    fw={600}
                    size={isLaptopOrTablet ? "28px" : "22px"}
                    pb={16}
                    style={{ textAlign: "center" }}
                  >
                    {collectionQuestion || "Which image is better?"}
                  </Text>
                  <VoteCards
                    handleVote={handleVote}
                    image1={image1}
                    image2={image2}
                    token={token}
                    isProcessingVote={isProcessingVote}
                    winnerImage={winnerImage}
                  />
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
      </div>
    </>
  );
};
