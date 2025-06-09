import { useEffect, useMemo, useState } from "react";
import { getCollections } from "../../Api/collections";
import { IGetCollections } from "../../Types/collection";
import { Accordion } from "@mantine/core";
import { CollectionsGrid } from "./Components/CollectionsGrid/CollectionsStack";
import { usePage } from "../../Hooks/usePage";
import classes from "./MyCollections.module.css";

export const MyCollections = () => {
  usePage("my-collections");

  const [collections, setCollections] = useState<IGetCollections>([]);

  useEffect(() => {
    getCollections({ onlySelf: true }).then(setCollections);
  }, []);

  const {
    personal: personalCollections,
    private: privateCollections,
    public: publicCollections,
  } = useMemo(
    () =>
      collections.reduce(
        (acc, el) => {
          if (el.mode === "PERSONAL") {
            acc.personal.push(el);
          } else if (el.mode === "PRIVATE") {
            acc.private.push(el);
          } else if (el.mode === "PUBLIC") {
            acc.public.push(el);
          }

          return acc;
        },
        {
          personal: [],
          private: [],
          public: [],
        } as Record<"personal" | "private" | "public", IGetCollections>
      ),
    [collections]
  );

  return (
    <Accordion
      multiple
      defaultValue={["public", "private", "personal"]}
      variant="contained"
    >
      <Accordion.Item value="public">
        <Accordion.Control
          classNames={{ label: classes.collectionsSectionLabel }}
        >
          Public Collections ({publicCollections.length})
        </Accordion.Control>
        <Accordion.Panel>
          <CollectionsGrid collections={publicCollections} />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="private">
        <Accordion.Control
          classNames={{ label: classes.collectionsSectionLabel }}
        >
          Private Collections ({privateCollections.length})
        </Accordion.Control>
        <Accordion.Panel>
          <CollectionsGrid collections={privateCollections} />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="personal">
        <Accordion.Control
          classNames={{ label: classes.collectionsSectionLabel }}
        >
          Personal Collections ({personalCollections.length})
        </Accordion.Control>
        <Accordion.Panel>
          <CollectionsGrid collections={personalCollections} />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
