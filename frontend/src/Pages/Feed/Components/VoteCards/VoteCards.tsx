import { Card, Flex, Stack, Checkbox } from "@mantine/core";
import classes from "./VoteCards.module.css";
import { VoteOutcome } from "../../../../Api/duels";
import { Image } from "../../../../Components/Image/Image";
import { MEDIA_QUERY_IS_MOBILE_OR_TABLET } from "../../../../Utils/breakpoints";
import { useMediaQuery } from "@mantine/hooks";

interface Props {
  handleVote: (
    outcome: VoteOutcome,
    token: string | undefined
  ) => (event?: React.MouseEvent<HTMLDivElement>) => Promise<void>;
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
  isProcessingVote?: boolean;
  winnerImage?: "image1" | "image2";
}

export const VoteCards = ({
  handleVote,
  token,
  image1,
  image2,
  isProcessingVote = false,
  winnerImage,
}: Props) => {
  const isMobile = useMediaQuery(MEDIA_QUERY_IS_MOBILE_OR_TABLET);

  if (isMobile) {
    return (
      <Stack gap={6} flex={1}>
        <Card
          withBorder
          className={`${classes.imageCard} ${classes.imageCardMobile} ${
            isProcessingVote && winnerImage === "image1"
              ? classes.imageCardSelected
              : ""
          }`}
          onClick={handleVote("WIN", token)}
          bg="#ffffff"
          radius={12}
        >
          <Card.Section
            withBorder
            style={{
              display: "flex",
              position: "relative",
              height: "100%",
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
                    backgroundColor: "#00000040",
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
                      fontSize: 44,
                      fontWeight: 600,
                      zIndex: 100,
                      margin: 0,
                    }}
                  >
                    {(image1.winProb * 100).toFixed(1)}
                    <span
                      style={{
                        fontSize: 22,
                      }}
                    >
                      %
                    </span>
                  </p>
                )}
              </>
            )}
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
              sizes="100vw"
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
              sizes="100vw"
            />
          </Card.Section>
        </Card>
        <Card
          withBorder
          className={`${classes.imageCard} ${classes.imageCardMobile} ${
            isProcessingVote && winnerImage === "image2"
              ? classes.imageCardSelected
              : ""
          }`}
          onClick={handleVote("LOSS", token)}
          bg="#ffffff"
          radius={12}
        >
          <Card.Section
            withBorder
            style={{
              display: "flex",
              position: "relative",
              height: "100%",
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
                    backgroundColor: "#00000040",
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
                      fontSize: 44,
                      fontWeight: 600,
                      zIndex: 100,
                      margin: 0,
                    }}
                  >
                    {(image2.winProb * 100).toFixed(1)}
                    <span
                      style={{
                        fontSize: 22,
                      }}
                    >
                      %
                    </span>
                  </p>
                )}
              </>
            )}
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
              sizes="100vw"
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
              sizes="100vw"
            />
          </Card.Section>
        </Card>
      </Stack>
    );
  }

  return (
    <Flex
      gap={16}
      flex={1}
      style={{
        maxHeight: "60cqw",
      }}
    >
      <Card
        withBorder
        className={`${classes.imageCard} ${
          isProcessingVote && winnerImage === "image1"
            ? classes.imageCardSelected
            : ""
        }`}
        onClick={handleVote("WIN", token)}
        bg="#ffffff"
        radius={20}
      >
        <Card.Section
          withBorder
          style={{
            display: "flex",
            position: "relative",
            height: "100%",
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
                    fontSize: 100,
                    fontWeight: 600,
                    zIndex: 100,
                    margin: 0,
                  }}
                >
                  {(image1.winProb * 100).toFixed(1)}
                  <span
                    style={{
                      fontSize: 50,
                    }}
                  >
                    %
                  </span>
                </p>
              )}
            </>
          )}
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
        className={`${classes.imageCard} ${
          isProcessingVote && winnerImage === "image2"
            ? classes.imageCardSelected
            : ""
        }`}
        onClick={handleVote("LOSS", token)}
        bg="#ffffff"
        radius={20}
      >
        <Card.Section
          withBorder
          style={{
            display: "flex",
            position: "relative",
            height: "100%",
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
                    fontSize: 100,
                    fontWeight: 600,
                    zIndex: 100,
                    margin: 0,
                  }}
                >
                  {(image2.winProb * 100).toFixed(1)}
                  <span
                    style={{
                      fontSize: 50,
                    }}
                  >
                    %
                  </span>
                </p>
              )}
            </>
          )}
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
  );
};
