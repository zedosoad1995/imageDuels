import { useEffect, useState } from "react";
import { getCollections, IGetCollections } from "../../Api/collections";
import classes from "./Explore.module.css";
import { useNavigate } from "react-router";
import {
  Affix,
  ActionIcon,
  Card,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import PlusLogo from "../../assets/svgs/plus.svg?react";

export const Explore = () => {
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const [collections, setCollections] = useState<IGetCollections>([]);

  useEffect(() => {
    getCollections().then(setCollections);
  }, []);

  const handleClickCollection = (id: string) => () => {
    navigate(`/collection/${id}`);
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
        <ActionIcon radius="xl" size={64}>
          <PlusLogo color={theme.white} height={28} width={28} />
        </ActionIcon>
      </Affix>
    </>
  );
};
