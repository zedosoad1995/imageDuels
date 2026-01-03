import { useEffect, useMemo, useState } from "react";
import { getCollections } from "../../Api/collections";
import { IGetCollections } from "../../Types/collection";
import { Accordion, Title } from "@mantine/core";
import { CollectionsGrid } from "./Components/CollectionsGrid/CollectionsStack";
import { usePage } from "../../Hooks/usePage";
import classes from "./MyCollections.module.css";
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
    </>
  );
};
