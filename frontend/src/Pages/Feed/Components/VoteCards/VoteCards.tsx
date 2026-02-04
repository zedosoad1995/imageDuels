import { Card, Flex, Stack } from "@mantine/core";
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
  };
  image2: {
    filepath: string;
    hasPlaceholder: boolean;
    availableWidths: number[];
    availableFormats: string[];
    isSvg: boolean;
  };
}

export const VoteCards = ({ handleVote, token, image1, image2 }: Props) => {
  const isMobile = useMediaQuery(MEDIA_QUERY_IS_MOBILE_OR_TABLET);

  if (isMobile) {
    return (
      <Stack gap={4} flex={1}>
        <Card
          withBorder
          className={classes.imageCard}
          onClick={handleVote("WIN", token)}
          bg="#FAFAFA"
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
          onClick={handleVote("LOSS", token)}
          bg="#FAFAFA"
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
      </Stack>
    );
  }

  return (
    <Flex
      gap={8}
      flex={1}
      style={{
        maxHeight: "60cqw",
      }}
    >
      <Card
        withBorder
        className={classes.imageCard}
        onClick={handleVote("WIN", token)}
        bg="#FAFAFA"
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
        onClick={handleVote("LOSS", token)}
        bg="#FAFAFA"
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
