import { Badge, Grid, Group, Text, Paper, Box } from "@mantine/core";
import { IGetCollections } from "../../../../Types/collection";
import { useNavigate, useLocation } from "react-router";
import { Collage } from "../../../../Components/Collage/Collage";
import classes from "./CollectionsStack.module.css";

interface Props {
  collections: IGetCollections["collections"];
}

export const CollectionsGrid = ({ collections }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClickCollection = (id: string) => () => {
    navigate(`/collections/${id}`, { state: { from: location.pathname } });
  };

  return (
    <Grid gutter={{ base: 16, sm: 20, md: 28 }}>
      {collections.map(
        ({
          id,
          title,
          thumbnailImages,
          totalVotes,
          totalImages,
          isNSFW,
          isLive,
          isValid,
        }) => {
          return (
            <Grid.Col key={id} span={{ base: 12, xs: 6, lg: 4, xl: 3 }}>
              <Paper
                className={`${classes.collectionCard} collectionExploreBase`}
                onClick={handleClickCollection(id)}
                p={0}
                withBorder={false}
              >
                <Collage images={thumbnailImages} />
                <Box className={classes.cardContent}>
                  <Group className={classes.titleRow}>
                    <Text
                      className={classes.title}
                      lineClamp={2}
                      styles={{ root: { fontWeight: 700 } }}
                    >
                      {title}
                    </Text>
                    {isNSFW && (
                      <Badge
                        className={classes.badge}
                        size="sm"
                        variant="light"
                        color="red"
                        styles={{
                          root: {
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          },
                        }}
                      >
                        NSFW +18
                      </Badge>
                    )}
                    {!isLive && (
                      <Badge
                        className={classes.badge}
                        size="sm"
                        variant="light"
                        color="gray"
                        styles={{
                          root: {
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          },
                        }}
                      >
                        Offline
                      </Badge>
                    )}
                    {!isValid && (
                      <Badge
                        className={classes.badge}
                        size="sm"
                        variant="light"
                        color="yellow"
                        styles={{
                          root: {
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.6px",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          },
                        }}
                      >
                        Draft
                      </Badge>
                    )}
                  </Group>
                  <Text
                    className={classes.stats}
                    styles={{
                      root: {
                        fontSize: "13px",
                        color: "#64748b",
                        fontWeight: 500,
                        lineHeight: 1.5,
                        letterSpacing: 0,
                      },
                    }}
                  >
                    {totalVotes} votes • {totalImages} images
                  </Text>
                </Box>
              </Paper>
            </Grid.Col>
          );
        }
      )}
    </Grid>
  );
};
