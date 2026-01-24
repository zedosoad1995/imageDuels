import { useEffect, useMemo, useState } from "react";
import { getCollections } from "../../Api/collections";
import { IGetCollections } from "../../Types/collection";
import { Tabs, Title } from "@mantine/core";
import { CollectionsGrid } from "./Components/CollectionsGrid/CollectionsStack";
import { usePage } from "../../Hooks/usePage";
import { useMediaQuery } from "@mantine/hooks";
import { MEDIA_QUERY_DESKTOP } from "../../Utils/breakpoints";
import { useInfiniteScroll } from "../../Hooks/useInfiniteScroll";

export const MyCollections = () => {
  usePage("my-collections");
  const isDesktop = useMediaQuery(MEDIA_QUERY_DESKTOP);

  const [collections, setCollections] = useState<
    IGetCollections["collections"]
  >([]);
  const [cursor, setCursor] = useState<IGetCollections["nextCursor"]>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sentinelRef = useInfiniteScroll({
    hasMore: Boolean(cursor),
    isLoading: isLoading,
    onLoadMore: () => {
      setIsLoading(true);
      getCollections({
        onlySelf: true,
        cursor,
      })
        .then(({ collections, nextCursor }) => {
          setCollections((prev) => [...prev, ...collections]);
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
    getCollections({ onlySelf: true })
      .then(({ collections, nextCursor }) => {
        setCollections(collections);
        setCursor(nextCursor);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
        } as Record<
          "personal" | "private" | "public",
          IGetCollections["collections"]
        >
      ),
    [collections]
  );

  return (
    <>
      {isDesktop && (
        <Title order={2} pb="sm">
          My Collections
        </Title>
      )}
      <Tabs defaultValue={"public"} keepMounted={true}>
        <Tabs.List>
          <Tabs.Tab value="public">Public</Tabs.Tab>
          <Tabs.Tab value="private">Private</Tabs.Tab>
          <Tabs.Tab value="personal">Personal</Tabs.Tab>
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
    </>
  );
};
