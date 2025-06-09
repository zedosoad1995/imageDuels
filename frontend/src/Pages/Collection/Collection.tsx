import { useContext, useState } from "react";
import { useParams } from "react-router";
import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Tabs,
  Text,
  Tooltip,
} from "@mantine/core";
import { Images } from "./Components/Images/Images";
import { About } from "./Components/About/About";
import { Vote } from "./Components/Vote/Vote";
import {
  CollectionContext,
  CollectionProvider,
} from "../../Contexts/CollectionContext";
import { UserContext } from "../../Contexts/UserContext";
import { CopyButton } from "../../Components/CopyButton/CopyButton";
import { usePage } from "../../Hooks/usePage";
import { editCollection } from "../../Api/collections";
import MoreHorizontalIcon from "../../assets/svgs/more-horizontal.svg?react";
import PauseIcon from "../../assets/svgs/pause.svg?react";
import PlayIcon from "../../assets/svgs/play.svg?react";
import { CopyItem } from "../../Components/CopyItem/CopyItem";

export const CollectionChild = () => {
  const { collection, fetchCollection, setCollection } =
    useContext(CollectionContext);
  const { loggedIn } = useContext(UserContext);
  usePage("collection");

  const [showSubtitle, setShowSubtitle] = useState(false);

  if (!collection) {
    // TODO: placeholder when not found
    return null;
  }

  const handleClickOffline = async () => {
    await editCollection(collection.id, {
      isLive: true,
    });
    await fetchCollection();
  };

  const togglePausePlay = async () => {
    setCollection({ ...collection, isLive: !collection.isLive });
    await editCollection(collection.id, {
      isLive: !collection.isLive,
    });
    await fetchCollection();
  };

  return (
    <>
      <Group justify="space-between" wrap="nowrap">
        <Group>
          <Text fw={600} size="lg">
            {collection.title}
          </Text>
          {collection.isNSFW && (
            <Badge size="xs" color="red">
              NSFW
            </Badge>
          )}
          {!collection.isValid && (
            <Tooltip label="You must upload at least 2 images">
              <Badge size="xs" color="gray">
                Invalid
              </Badge>
            </Tooltip>
          )}
          {!collection.isLive && collection.isValid && (
            <Tooltip label="Click here, to go Live!">
              <Badge
                size="xs"
                color="gray"
                style={{ cursor: "pointer" }}
                onClick={handleClickOffline}
              >
                Offline
              </Badge>
            </Tooltip>
          )}
        </Group>
        {collection.mode !== "PERSONAL" && (
          <Menu shadow="md" width={150} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="default">
                <MoreHorizontalIcon size="1.2rem" />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {collection.belongsToMe && (
                <Menu.Item
                  onClick={togglePausePlay}
                  leftSection={
                    collection.isLive ? (
                      <PauseIcon height={15} />
                    ) : (
                      <PlayIcon height={15} />
                    )
                  }
                >
                  {collection.isLive ? "Pause" : "Go Live"}
                </Menu.Item>
              )}
              <CopyItem />
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
      {showSubtitle && (
        <>
          {collection.mode === "PRIVATE" && (
            <Group gap={4}>
              <Text fw={200} size="xs" c="dimmed">
                This collection is private. Click here to share
              </Text>
              <CopyButton copyValue={window.location.href} size="xs" />
            </Group>
          )}
        </>
      )}
      <Tabs
        defaultValue={loggedIn ? "vote" : "images"}
        onChange={(value) => {
          if (value === "images") {
            setShowSubtitle(true);
          } else {
            setShowSubtitle(false);
          }
        }}
      >
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
