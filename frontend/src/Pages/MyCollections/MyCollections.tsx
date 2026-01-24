import { useEffect, useState } from "react";
import { getCollections } from "../../Api/collections";
import { CollectionModeType, IGetCollections } from "../../Types/collection";
import { Tabs, Title } from "@mantine/core";
import { CollectionsGrid } from "./Components/CollectionsGrid/CollectionsStack";
import { usePage } from "../../Hooks/usePage";
import { useMediaQuery } from "@mantine/hooks";
import { MEDIA_QUERY_DESKTOP } from "../../Utils/breakpoints";
import { useInfiniteScroll } from "../../Hooks/useInfiniteScroll";

enum TabValue {
  PUBLIC = "public",
  PRIVATE = "private",
  PERSONAL = "personal",
}

export const MyCollections = () => {
  usePage("my-collections");
  const isDesktop = useMediaQuery(MEDIA_QUERY_DESKTOP);

  const [publicCollections, setPublicCollections] = useState<
    IGetCollections["collections"]
  >([]);
  const [privateCollections, setPrivateCollections] = useState<
    IGetCollections["collections"]
  >([]);
  const [personalCollections, setPersonalCollections] = useState<
    IGetCollections["collections"]
  >([]);
  const [publicCursor, setPublicCursor] =
    useState<IGetCollections["nextCursor"]>(null);
  const [privateCursor, setPrivateCursor] =
    useState<IGetCollections["nextCursor"]>(null);
  const [personalCursor, setPersonalCursor] =
    useState<IGetCollections["nextCursor"]>(null);

  const [currTab, setCurrTab] = useState<TabValue>(TabValue.PUBLIC);

  const [isLoading, setIsLoading] = useState(false);

  const mapValues = {
    public: {
      cursor: publicCursor,
      setCursor: setPublicCursor,
      currCollections: publicCollections,
      setCurrCollections: setPublicCollections,
      mode: CollectionModeType.PUBLIC,
    },
    private: {
      cursor: privateCursor,
      setCursor: setPrivateCursor,
      currCollections: privateCollections,
      setCurrCollections: setPrivateCollections,
      mode: CollectionModeType.PRIVATE,
    },
    personal: {
      cursor: personalCursor,
      setCursor: setPersonalCursor,
      currCollections: personalCollections,
      setCurrCollections: setPersonalCollections,
      mode: CollectionModeType.PERSONAL,
    },
  };

  const { cursor, setCursor, setCurrCollections, mode } = mapValues[currTab];

  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(cursor),
    isLoading: isLoading,
    onLoadMore: () => {
      setIsLoading(true);
      getCollections({
        onlySelf: true,
        cursor,
        mode: mode,
      })
        .then(({ collections, nextCursor }) => {
          setCurrCollections((prev) => [...prev, ...collections]);
          setCursor(nextCursor);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    rootMargin: "2000px",
  });

  useEffect(() => {
    setIsLoading(true);
    getCollections({ onlySelf: true, mode: CollectionModeType.PUBLIC })
      .then(({ collections, nextCursor }) => {
        setCurrCollections(collections);
        setCursor(nextCursor);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      {isDesktop && (
        <Title order={2} pb="sm">
          My Collections
        </Title>
      )}
      <Tabs
        defaultValue={currTab}
        keepMounted={true}
        onChange={(value) => {
          if (!value) return;

          setCurrTab(value as TabValue);

          const { setCurrCollections, mode, currCollections, setCursor } =
            mapValues[value as TabValue];

          if (currCollections.length === 0) {
            getCollections({
              onlySelf: true,
              mode,
            })
              .then(({ collections, nextCursor }) => {
                setCurrCollections(collections);
                setCursor(nextCursor);
              })
              .finally(() => {
                setIsLoading(false);
              });
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value={TabValue.PUBLIC}>Public</Tabs.Tab>
          <Tabs.Tab value={TabValue.PRIVATE}>Private</Tabs.Tab>
          <Tabs.Tab value={TabValue.PERSONAL}>Personal</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="public" pt={8}>
          <CollectionsGrid collections={publicCollections} />
        </Tabs.Panel>

        <Tabs.Panel value="private" pt={8}>
          <CollectionsGrid collections={privateCollections} />
        </Tabs.Panel>

        <Tabs.Panel value="personal" pt={8}>
          <CollectionsGrid collections={personalCollections} />
        </Tabs.Panel>
      </Tabs>
      <div ref={sentinelRef} style={{ height: 1 }} />
    </>
  );
};
