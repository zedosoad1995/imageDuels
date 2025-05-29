import { useContext, useEffect, useState } from "react";
import { getCollections } from "../../Api/collections";
import classes from "./Explore.module.css";
import { useNavigate } from "react-router";
import {
  Card,
  Stack,
  Text,
  Group,
  SegmentedControl,
  Badge,
} from "@mantine/core";
import {
  IGetCollections,
  IGetCollectionsOrderBy,
} from "../../Types/collection";
import { UserContext } from "../../Contexts/UserContext";
import { usePage } from "../../Hooks/usePage";
import { Collage } from "./Components/Collage/Collage";

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

  useEffect(() => {
    getCollections({ orderBy }).then(setCollections);
  }, [orderBy]);

  const handleClickCollection = (id: string) => () => {
    navigate(`/collections/${id}`);
  };

  const handleChangeOrderBy = (value: string) => {
    setOrderBy(value as IGetCollectionsOrderBy);
  };

  return (
    <>
      <SegmentedControl
        mb={16}
        data={orderValues}
        value={orderBy}
        onChange={handleChangeOrderBy}
      />
      <Stack gap={12}>
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
              <Card
                key={id}
                className={classes.card}
                onClick={handleClickCollection(id)}
                p="xs"
                withBorder
              >
                <Group mb={8}>
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
                <Collage height={220} images={thumbnailImages} />
                <Text fw={300} size="xs" mt={8}>
                  {totalVotes} votes • {totalImages} images
                  {user?.role === "ADMIN" && (
                    <>
                      {" "}
                      • by <i>{createdBy}</i>
                    </>
                  )}
                </Text>
              </Card>
            );
          }
        )}
      </Stack>
    </>
  );
};
