import { Badge, Grid, Group, Text } from "@mantine/core";
import { IGetCollections } from "../../../../Types/collection";
import { useNavigate } from "react-router";
import { Collage } from "../../../../Components/Collage/Collage";

interface Props {
  collections: IGetCollections["collections"];
}

export const CollectionsGrid = ({ collections }: Props) => {
  const navigate = useNavigate();

  const handleClickCollection = (id: string) => () => {
    navigate(`/collections/${id}`);
  };

  return (
    <Grid>
      {collections.map(
        ({
          id,
          title,
          thumbnailImages,
          totalVotes,
          totalImages,
          isNSFW,
          isLive,
          isValid,
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
                {isNSFW && (
                  <Badge size="xs" variant="light" color="red">
                    NSFW +18
                  </Badge>
                )}
                {!isLive && (
                  <Badge size="xs" variant="light" color="gray">
                    Offline
                  </Badge>
                )}
                {!isValid && (
                  <Badge size="xs" variant="light" color="yellow">
                    Draft
                  </Badge>
                )}
              </Group>
              <Text fw={300} size="xs" pl={0}>
                {totalVotes} votes • {totalImages} images
              </Text>
            </Grid.Col>
          );
        }
      )}
    </Grid>
  );
};
