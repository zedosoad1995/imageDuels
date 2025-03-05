import { useContext } from "react";
import { useParams } from "react-router";
import { Tabs, Text } from "@mantine/core";
import { Images } from "./Components/Images/Images";
import { About } from "./Components/About/About";
import { Vote } from "./Components/Vote/Vote";
import {
  CollectionContext,
  CollectionProvider,
} from "../../Contexts/CollectionContext";

export const CollectionChild = () => {
  const { collection, fetchCollection } = useContext(CollectionContext);

  if (!collection) {
    return null;
  }

  return (
    <>
      <Text fw={600} size="lg">
        {collection.title}
      </Text>
      <Tabs defaultValue="vote">
        <Tabs.List>
          <Tabs.Tab value="vote">Vote</Tabs.Tab>
          <Tabs.Tab value="images" onClick={fetchCollection}>
            Images
          </Tabs.Tab>
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
    </>
  );
};

export const Collection = () => {
  const { id } = useParams();

  return (
    <CollectionProvider collectionId={id}>
      <CollectionChild />
    </CollectionProvider>
  );
};
