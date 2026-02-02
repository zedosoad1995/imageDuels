import { useContext, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
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
import { editCollection } from "../../Api/collections";
import MoreHorizontalIcon from "../../assets/svgs/more-horizontal.svg?react";
import PauseIcon from "../../assets/svgs/pause.svg?react";
import PlayIcon from "../../assets/svgs/play.svg?react";
import ArrowBackIcon from "../../assets/svgs/arrow-back.svg?react";
import { CopyItem } from "../../Components/CopyItem/CopyItem";
import { usePage } from "../../Hooks/usePage";
import classes from "./Collection.module.css";
import { MEDIA_QUERY_IS_MOBILE } from "../../Utils/breakpoints";
import { useMediaQuery } from "@mantine/hooks";

export const CollectionChild = () => {
  const { collection, fetchCollection, setCollection } =
    useContext(CollectionContext);
  const { loggedIn, user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery(MEDIA_QUERY_IS_MOBILE);
  const isTablet = useMediaQuery("(max-width: 800px)");

  usePage("collection");

  const [showSubtitle, setShowSubtitle] = useState(false);

  if (!collection) {
    // TODO: placeholder when not found
    return null;
  }

  const handleClickOffline = async () => {
    const prev = collection;
    const optimistic = { ...prev, isLive: true };

    setCollection(optimistic);

    try {
      await editCollection(prev.id, { isLive: true });
    } catch (e) {
      setCollection(prev);
    }
  };

  const togglePausePlay = async () => {
    const prev = collection;
    const optimistic = { ...prev, isLive: !prev.isLive };

    setCollection(optimistic);

    try {
      await editCollection(prev.id, { isLive: optimistic.isLive });
    } catch (e) {
      setCollection(prev); // rollback
    }
  };

  return (
    <>
      <Group justify="space-between" wrap="nowrap">
        <Group gap={8}>
          {isTablet && (
            <ActionIcon
              radius="xl"
              size="sm"
              variant="subtle"
              onClick={() => {
                // Check if we have state with previous location
                const previousPath = location.state?.from;
                if (previousPath) {
                  navigate(previousPath);
                } else {
                  navigate("/");
                }
              }}
              className={classes.backButton}
            >
              <ArrowBackIcon />
            </ActionIcon>
          )}
          <Text fw={600} size={isMobile ? "md" : "lg"}>
            {collection.title}
          </Text>
          {collection.mode === "PRIVATE" && (
            <Tooltip label="Only people with the link can view this collection">
              <Badge size="xs" variant="light" color="blue">
                Private
              </Badge>
            </Tooltip>
          )}
          {collection.mode === "PERSONAL" && (
            <Tooltip label="Only you can view this collections">
              <Badge size="xs" variant="light" color="blue">
                Personal
              </Badge>
            </Tooltip>
          )}
          {collection.isNSFW && (
            <Tooltip label="Visible only to 18+ users with mature content enabled">
              <Badge size="xs" variant="light" color="red">
                NSFW
              </Badge>
            </Tooltip>
          )}
          {!collection.isValid && (
            <Tooltip label="You must upload at least 2 images">
              <Badge size="xs" variant="light" color="yellow">
                Draft
              </Badge>
            </Tooltip>
          )}
          {!collection.isLive && collection.isValid && (
            <Tooltip label="Click here, to go Live!">
              <Badge
                size="xs"
                variant="light"
                color="gray"
                style={{ cursor: "pointer" }}
                onPointerDown={(e) => {
                  if (e.pointerType !== "mouse") return;
                  handleClickOffline();
                }}
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
                  disabled={!collection.isValid}
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
              <CopyItem disabled={!collection.isValid} />
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
        defaultValue={loggedIn && collection.isValid ? "vote" : "images"}
        classNames={{
          list: classes.tabsList,
          tab: classes.tab,
          root: classes.root,
        }}
        keepMounted={false}
        onChange={(value) => {
          if (value === "images") {
            setShowSubtitle(true);
          } else {
            setShowSubtitle(false);
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="vote" disabled={!collection.isValid}>
            Vote
          </Tabs.Tab>
          <Tabs.Tab value="images" onClick={fetchCollection}>
            Images
          </Tabs.Tab>
          {(user?.role === "ADMIN" ||
            collection.belongsToMe ||
            collection.description) && <Tabs.Tab value="about">About</Tabs.Tab>}
        </Tabs.List>

        <Tabs.Panel
          value="vote"
          pt={8}
          style={{ display: "flex", flexDirection: "column", flex: 1 }}
        >
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
