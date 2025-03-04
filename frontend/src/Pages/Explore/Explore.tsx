import { useEffect, useState } from "react";
import { getCollections } from "../../Api/collections";
import classes from "./Explore.module.css";
import { useNavigate } from "react-router";
import {
  Affix,
  ActionIcon,
  Card,
  Stack,
  Text,
  Group,
  SegmentedControl,
} from "@mantine/core";
import PlusLogo from "../../assets/svgs/plus.svg?react";
import {
  IGetCollections,
  IGetCollectionsOrderBy,
} from "../../Types/collection";
import { Image } from "../../Components/Image/Image";

const orderValues: { value: IGetCollectionsOrderBy; label: string }[] = [
  {
    value: "new",
    label: "New",
  },
  { value: "popular", label: "Popular" },
];

export const Explore = () => {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<IGetCollections>([]);
  const [orderBy, setOrderBy] = useState<IGetCollectionsOrderBy>("new");

  useEffect(() => {
    getCollections({ orderBy }).then(setCollections);
  }, [orderBy]);

  const handleClickCollection = (id: string) => () => {
    navigate(`/collection/${id}`);
  };

  const handleClickAddCollection = () => {
    navigate("/collection/create");
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
          ({ id, title, thumbnailImages, totalVotes, totalImages }) => (
            <Card
              key={id}
              className={classes.card}
              onClick={handleClickCollection(id)}
              p="xs"
              withBorder
            >
              <Text fw={700} mb={8}>
                {title}
              </Text>
              <Group
                justify="flex-start"
                wrap="nowrap"
                style={{ overflow: "hidden" }}
              >
                {thumbnailImages.map((filepath) => (
                  <Card withBorder miw={150}>
                    <Card.Section withBorder style={{ textAlign: "center" }}>
                      <Image filepath={filepath} />
                    </Card.Section>
                  </Card>
                ))}
              </Group>
              <Text fw={300} size="xs" mt={8}>
                {totalVotes} votes • {totalImages} images
              </Text>
            </Card>
          )
        )}
      </Stack>
      <Affix position={{ bottom: 20, right: 20 }}>
        <ActionIcon radius="xl" size="xl" onClick={handleClickAddCollection}>
          <PlusLogo />
        </ActionIcon>
      </Affix>
    </>
  );
};
