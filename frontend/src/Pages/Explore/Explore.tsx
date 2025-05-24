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
import { getImageURL } from "../../Utils/image";

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
          }) => (
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
              <Group
                justify="flex-start"
                wrap="nowrap"
                style={{ overflow: "hidden" }}
                gap={2}
              >
                {thumbnailImages.map((filepath) => (
                  <div
                    key={filepath}
                    style={{
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={getImageURL(filepath)}
                      style={{
                        height: 180,
                        minWidth: "100%",
                        display: "block",
                      }}
                    />
                  </div>
                ))}
              </Group>
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
          )
        )}
      </Stack>
    </>
  );
};
