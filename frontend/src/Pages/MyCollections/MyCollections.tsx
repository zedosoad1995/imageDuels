import { useEffect, useMemo, useState } from "react";
import { getCollections } from "../../Api/collections";
import { IGetCollections } from "../../Types/collection";
import { Accordion } from "@mantine/core";
import { CollectionsStack } from "./Components/CollectionsStack/CollectionsStack";

export const MyCollections = () => {
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
    <Accordion multiple defaultValue={["public", "private", "personal"]}>
      <Accordion.Item value="public">
        <Accordion.Control>
          Public Collections ({publicCollections.length})
        </Accordion.Control>
        <Accordion.Panel>
          <CollectionsStack collections={publicCollections} />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="private">
        <Accordion.Control>
          Private Collections ({privateCollections.length})
        </Accordion.Control>
        <Accordion.Panel>
          <CollectionsStack collections={privateCollections} />
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="personal">
        <Accordion.Control>
          Personal Collections ({personalCollections.length})
        </Accordion.Control>
        <Accordion.Panel>
          <CollectionsStack collections={personalCollections} />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};
