import { useCallback, useContext, useEffect, useState } from "react";
import { getCollections } from "../../Api/collections";
import { useNavigate } from "react-router";
import {
  Text,
  Group,
  SegmentedControl,
  Badge,
  Grid,
  TextInput,
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

const orderValues: { value: IGetCollectionsOrderBy; label: string }[] = [
  {
    value: "new",
    label: "New",
  },
  { value: "popular", label: "Popular" },
];

export const Collections = () => {
  const navigate = useNavigate();
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
    rootMargin: "2000px",
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
    navigate(`/collections/${id}`);
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
    <>
      <Group mb={16}>
        <SegmentedControl
          data={orderValues}
          value={orderBy}
          onChange={handleChangeOrderBy}
        />
        <TextInput
          radius="md"
          size="md"
          placeholder="Search"
          leftSection={<SearchIcon size={18} stroke={1.5} />}
          style={{ flex: 1 }}
          value={search}
          onChange={handleChangeSearch}
        />
      </Group>
      <Grid>
        {collections.map(
          ({
            id,
            title,
            thumbnailImages,
            totalVotes,
            totalImages,
            mode,
            isNSFW,
            createdBy,
          }) => {
            return (
              <Grid.Col
                key={id}
                span={{ base: 12, xs: 6, lg: 4, xl: 3 }}
                className="collectionExploreBase"
                onClick={handleClickCollection(id)}
              >
                <Collage images={thumbnailImages} />
                <Group mt={2} pl={0} gap={8}>
                  <Text fw={700}>{title}</Text>
                  {user?.role === "ADMIN" && (
                    <Badge size="xs" color="gray">
                      {mode.toLowerCase()}
                    </Badge>
                  )}
                  {isNSFW && (
                    <Badge size="xs" color="red">
                      NSFW +18
                    </Badge>
                  )}
                </Group>
                <Text fw={300} size="xs" pl={0}>
                  {totalVotes} votes • {totalImages} images
                  {user?.role === "ADMIN" && (
                    <>
                      {" "}
                      • by <i>{createdBy}</i>
                    </>
                  )}
                </Text>
              </Grid.Col>
            );
          }
        )}
      </Grid>
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  );
};
