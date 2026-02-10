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
              border: "1px solid rgba(255, 255, 255, 0.3)",
              backgroundColor: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)",
              "&:focus": {
                border: "1px solid rgba(91, 110, 242, 0.4)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                boxShadow:
                  "0 6px 8px -1px rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.08), 0 0 0 3px rgba(91, 110, 242, 0.1), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)",
              },
            },
          }}
        />
      </Group>
      <Grid gutter={{ base: 16, sm: 20, md: 24 }}>
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
                      <Text className={classes.title} lineClamp={2}>
                        {title}
                      </Text>
                      {user?.role === "ADMIN" && mode !== "PUBLIC" && (
                        <Badge
                          className={classes.badge}
                          size="sm"
                          variant="light"
                          color="blue"
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
                        >
                          Offline
                        </Badge>
                      )}
                    </Group>
                    <Text className={classes.stats}>
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
