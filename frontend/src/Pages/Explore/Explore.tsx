import { useEffect, useState } from "react";
import { getCollections, IGetCollections } from "../../Api/collections";
import classes from "./Explore.module.css";
import { useNavigate } from "react-router";
import { Affix, ActionIcon, Card, Stack, Text } from "@mantine/core";
import PlusLogo from "../../assets/svgs/plus.svg?react";

export const Explore = () => {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<IGetCollections>([]);

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  const handleClickCollection = (id: string) => () => {
    navigate(`/collection/${id}`);
  };

  const handleClickAddCollection = () => {
    navigate("/collection/create");
  };

  return (
    <>
      <Stack gap={12}>
        {collections.map(({ id, title }) => (
          <Card
            key={id}
            className={classes.card}
            onClick={handleClickCollection(id)}
            withBorder
          >
            <Text>{title}</Text>
          </Card>
        ))}
      </Stack>
      <Affix position={{ bottom: 20, right: 20 }}>
        <ActionIcon radius="xl" size="xl" onClick={handleClickAddCollection}>
          <PlusLogo />
        </ActionIcon>
      </Affix>
    </>
  );
};
