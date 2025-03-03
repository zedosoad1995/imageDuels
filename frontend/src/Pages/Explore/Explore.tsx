import { useEffect, useState } from "react";
import { getCollections } from "../../Api/collections";
import classes from "./Explore.module.css";
import { useNavigate } from "react-router";
import { Affix, ActionIcon, Card, Stack, Text, Group } from "@mantine/core";
import PlusLogo from "../../assets/svgs/plus.svg?react";
import { IGetCollections } from "../../Types/collection";
import { getImageURL } from "../../Utils/image";

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
        {collections.map(
          ({ id, title, thumbnailImages, totalVotes, totalImages }) => (
            <Card
              key={id}
              className={classes.card}
              onClick={handleClickCollection(id)}
              p="xs"
              withBorder
            >
              <Text fw={700} mb={4}>
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
                      <div
                        className={classes.image}
                        style={{
                          backgroundImage: `url(${getImageURL(filepath)})`,
                        }}
                      />
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
