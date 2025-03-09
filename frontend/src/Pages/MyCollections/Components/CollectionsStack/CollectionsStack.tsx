import { Card, Group, Stack, Text } from "@mantine/core";
import { Image } from "../../../../Components/Image/Image";
import { IGetCollections } from "../../../../Types/collection";
import classes from "./CollectionsStack.module.css";
import { useNavigate } from "react-router";

interface Props {
  collections: IGetCollections;
}

export const CollectionsStack = ({ collections }: Props) => {
  const navigate = useNavigate();

  const handleClickCollection = (id: string) => () => {
    navigate(`/collections/${id}`);
  };

  return (
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
  );
};
