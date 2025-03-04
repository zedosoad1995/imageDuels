import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getCollection } from "../../Api/collections";
import { Tabs, Text } from "@mantine/core";
import { Images } from "./Components/Images/Images";
import { About } from "./Components/About/About";
import { Vote } from "./Components/Vote/Vote";
import { IGetCollection } from "../../Types/collection";

export const Collection = () => {
  const { id } = useParams();
  const [collection, setCollection] = useState<IGetCollection>();

  useEffect(() => {
    if (!id) {
      return;
    }

    getCollection(id).then(setCollection);
  }, [id]);

  if (!collection) {
    return null;
  }

  return (
    <div>
      <Text fw={600} size="lg">
        {collection.title}
      </Text>
      <Tabs defaultValue="vote">
        <Tabs.List>
          <Tabs.Tab value="vote">Vote</Tabs.Tab>
          <Tabs.Tab value="images">Images</Tabs.Tab>
          <Tabs.Tab value="about">About</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="vote" pt={8}>
          <Vote collection={collection} />
        </Tabs.Panel>

        <Tabs.Panel value="images" pt={8}>
          <Images collection={collection} />
        </Tabs.Panel>

        <Tabs.Panel value="about" pt={8}>
          <About collection={collection} />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};
