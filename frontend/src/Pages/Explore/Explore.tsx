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

const orderValues: { value: IGetCollectionsOrderBy; label: string }[] = [
  {
    value: "new",
    label: "New",
  },
  { value: "popular", label: "Popular" },
];

export const Explore = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  usePage("explore");

  const [collections, setCollections] = useState<IGetCollections>([]);
  const [orderBy, setOrderBy] = useState<IGetCollectionsOrderBy>("new");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    getCollections({ orderBy, search: debouncedSearch || undefined }).then(
      setCollections
    );
  }, [orderBy, debouncedSearch]);

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
        leading: true,
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
    </>
  );
};
