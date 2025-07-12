import { useContext, useEffect, useState } from "react";
import { feed, vote, VoteOutcome } from "../../Api/duels";
import { getImageURL } from "../../Utils/image";
import { Card, Divider, Flex, Stack, Text } from "@mantine/core";
import classes from "./Feed.module.css";
import { UserContext } from "../../Contexts/UserContext";
import { modals } from "@mantine/modals";
import { useNavigate } from "react-router";
import { getDuel } from "../../Api/collections";
import { useMediaQuery } from "@mantine/hooks";

export const Feed = () => {
  const { loggedIn } = useContext(UserContext);
  const navigate = useNavigate();
  const isLaptopOrTablet = useMediaQuery("(min-width: 650px)");

  const [duels, setDuels] = useState<
    | {
        token: string | undefined;
        image1: string;
        image2: string;
        collectionId: string;
        collectionName: string;
      }[]
    | null
  >(null);

  useEffect(() => {
    feed().then(setDuels);
  }, []);

  const handleClickCollection = (collectionId: string) => () => {
    navigate(`/collections/${collectionId}`);
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
      }

      if (!token) {
        return;
      }

      await vote(token, outcome);

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

  const verticalPadding = isLaptopOrTablet ? 32 : 16;

  return (
    <Stack gap={0}>
      {duels?.map(
        ({ image1, image2, token, collectionId, collectionName }, index) => (
          <>
            <div
              style={{ cursor: "pointer" }}
              onClick={handleClickCollection(collectionId)}
            >
              <div
                style={{
                  marginBottom:
                    index === duels.length - 1 ? 0 : verticalPadding,
                  marginTop: index === 0 ? 0 : verticalPadding,
                }}
              >
                <Text
                  mb={isLaptopOrTablet ? 8 : 4}
                  size={isLaptopOrTablet ? "xl" : "l"}
                  fw={600}
                  lh={1}
                >
                  {collectionName}
                </Text>
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
              </div>
            </div>
            {index < duels.length - 1 && <Divider />}
          </>
        )
      )}
    </Stack>
  );
};
