import { useCallback, useContext, useEffect, useState } from "react";
import { getCollections } from "../../Api/collections";
import { useNavigate, useLocation } from "react-router";
import {
  Text,
  Group,
  SegmentedControl,
  Badge,
  Grid,
  TextInput,
  Paper,
  Box,
} from "@mantine/core";
import {
  IGetCollections,
  IGetCollectionsOrderBy,
} from "../../Types/collection";
import { UserContext } from "../../Contexts/UserContext";
import { usePage } from "../../Hooks/usePage";
import { Collage } from "../../Components/Collage/Collage";
import SearchIcon from "../../assets/svgs/search.svg?react";
import debounce from "lodash.debounce";
import { useInfiniteScroll } from "../../Hooks/useInfiniteScroll";
import classes from "./Collections.module.css";

const orderValues: { value: IGetCollectionsOrderBy; label: string }[] = [
  {
    value: "new",
    label: "New",
  },
  { value: "popular", label: "Popular" },
];

export const Collections = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loggedIn } = useContext(UserContext);
  usePage("collections");

  const [collections, setCollections] = useState<
    IGetCollections["collections"]
  >([]);
  const [cursor, setCursor] = useState<IGetCollections["nextCursor"]>(null);
  const [orderBy, setOrderBy] = useState<IGetCollectionsOrderBy>("new");
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(cursor),
    isLoading: isLoading,
    onLoadMore: () => {
      setIsLoading(true);
      getCollections({
        orderBy,
        search: debouncedSearch || undefined,
        cursor,
      })
        .then(({ collections, nextCursor }) => {
          setCollections((prev) => [...prev, ...collections]);
          setCursor(nextCursor);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    rootMargin: "1000px",
  });

  useEffect(() => {
    setIsLoading(true);
    getCollections({
      orderBy,
      search: debouncedSearch || undefined,
    })
      .then(({ collections, nextCursor }) => {
        setCollections(collections);
        setCursor(nextCursor);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderBy, debouncedSearch, loggedIn]);

  const handleClickCollection = (id: string) => () => {
    navigate(`/collections/${id}`, { state: { from: location.pathname } });
  };

  const handleChangeOrderBy = (value: string) => {
    setOrderBy(value as IGetCollectionsOrderBy);
  };

  const debouncedUpdateSearch = useCallback(
    debounce(
      async (text: string) => {
        setDebouncedSearch(text);
      },
      300,
      {
        trailing: true,
      }
    ),
    []
  );

  const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedUpdateSearch(event.currentTarget.value);
    setSearch(event.currentTarget.value);
  };

  return (
    <Box className={classes.container}>
      <Group className={classes.controls}>
        <SegmentedControl
          data={orderValues}
          value={orderBy}
          onChange={handleChangeOrderBy}
          size="md"
          className={classes.segmentedControl}
          style={{ flexShrink: 0 }}
          styles={{
            root: {
              backgroundColor: "#f1f5f9",
              border: "1px solid rgba(0, 0, 0, 0.1)",
              padding: "4px",
            },
            indicator: {
              backgroundColor: "#ffffff",
              boxShadow:
                "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
            },
            label: {
              color: "#475569",
              fontWeight: 500,
              fontSize: "14px",
              "&[data-active]": {
                color: "#0f172a",
                fontWeight: 600,
              },
            },
          }}
        />
        <TextInput
          className={classes.searchInput}
          size="md"
          placeholder="Search collections..."
          leftSection={<SearchIcon size={18} stroke={1.5} />}
          value={search}
          onChange={handleChangeSearch}
          styles={{
            input: {
              border: "1px solid rgba(0, 0, 0, 0.1)",
              backgroundColor: "#ffffff",
              color: "#0f172a",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              fontSize: "14px",
              "&::placeholder": {
                color: "#94a3b8",
              },
              "&:focus": {
                border: "1px solid rgba(59, 130, 246, 0.5)",
                boxShadow:
                  "0 0 0 4px rgba(59, 130, 246, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(59, 130, 246, 0.3)",
                transform: "translateY(-1px)",
              },
            },
          }}
        />
      </Group>
      <Grid gutter={{ base: 16, sm: 20, md: 28 }}>
        {collections.map(
          ({
            id,
            title,
            thumbnailImages,
            totalVotes,
            totalImages,
            mode,
            isNSFW,
            isLive,
            createdBy,
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
                      {user?.role === "ADMIN" && mode !== "PUBLIC" && (
                        <Badge
                          className={classes.badge}
                          size="sm"
                          variant="light"
                          color="blue"
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
                          {mode.toLowerCase()}
                        </Badge>
                      )}
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
                      {user?.role === "ADMIN" && !isLive && (
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
                      {user?.role === "ADMIN" && (
                        <>
                          {" "}
                          • by <i>{createdBy}</i>
                        </>
                      )}
                    </Text>
                  </Box>
                </Paper>
              </Grid.Col>
            );
          }
        )}
      </Grid>
      <div ref={sentinelRef} className={classes.loadingSentinel} />
    </Box>
  );
};
