import { useEffect, useState } from "react";
import { getCollections, IGetCollections } from "../../Api/collections";
import classes from "./Explore.module.css";
import { useNavigate } from "react-router";
import { Card, Stack, Text } from "@mantine/core";

export const Explore = () => {
  const navigate = useNavigate();

  const [collections, setCollections] = useState<IGetCollections>([]);

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  const handleClickCollection = (id: string) => () => {
    navigate(`/collection/${id}`);
  };

  return (
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
  );
};
