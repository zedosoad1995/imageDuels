import { AppShell, Button, Menu, Tooltip } from "@mantine/core";
import ExploreIcon from "../../../../assets/svgs/explore.svg?react";
import ExploreFillIcon from "../../../../assets/svgs/explore-fill.svg?react";
import CollectionsIcon from "../../../../assets/svgs/collections.svg?react";
import CollectionsFillIcon from "../../../../assets/svgs/collections-fill.svg?react";
import AddIcon from "../../../../assets/svgs/add-box.svg?react";
import AddFillIcon from "../../../../assets/svgs/add-box-fill.svg?react";
import AccountIcon from "../../../../assets/svgs/account.svg?react";
import AccountFillIcon from "../../../../assets/svgs/account-fill.svg?react";
import DuelIcon from "../../../../assets/svgs/duel.svg?react";
import DuelFillIcon from "../../../../assets/svgs/duel-fill.svg?react";
import classes from "./Footer.module.css";
import { usePage } from "../../../../Hooks/usePage";
import { useContext } from "react";
import { UserContext } from "../../../../Contexts/UserContext";
import { useNavigate } from "react-router";

export const Footer = () => {
  const page = usePage();
  const { loggedIn, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClickLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <AppShell.Footer className={classes.base}>
      <Tooltip position="top" label="Explore">
        <Button
          variant={"subtle"}
          className={classes.item}
          onClick={() => navigate("/")}
        >
          {page === "collections" && <ExploreFillIcon className={classes.itemIcon} />}
          {page !== "collections" && <ExploreIcon className={classes.itemIcon} />}
        </Button>
      </Tooltip>

      <Tooltip position="top" label="Duels">
        <Button
          variant={"subtle"}
          className={classes.item}
          onClick={() => navigate("/feed")}
        >
          {page === "feed" && <DuelFillIcon className={classes.itemIcon} />}
          {page !== "feed" && <DuelIcon className={classes.itemIcon} />}
        </Button>
      </Tooltip>

      <Tooltip position="top" label="Create Collection">
        <Button
          variant={"subtle"}
          className={classes.item}
          onClick={() => navigate("/collections/create")}
        >
          {page === "create-collection" && <AddFillIcon className={classes.itemIcon} />}
          {page !== "create-collection" && <AddIcon className={classes.itemIcon} />}
        </Button>
      </Tooltip>

      {loggedIn && (
        <Tooltip position="top" label="My Collections">
          <Button
            variant={page === "my-collections" ? "light" : "subtle"}
            className={classes.item}
            onClick={() => navigate("/collections/me")}
          >
            {page === "my-collections" && <CollectionsFillIcon className={classes.itemIcon} />}
            {page !== "my-collections" && <CollectionsIcon className={classes.itemIcon} />}  
          </Button>
        </Tooltip>
      )}
      <Menu shadow="md" width={150} position="top-end" floatingStrategy="fixed">
        <Menu.Target>
          <Tooltip position="top" label="Account">
            <Button
              variant={"subtle"}
              className={classes.item}
            >
              {["settings", "login", "register"].includes(page as string) && <AccountFillIcon className={classes.itemIcon} />}
              {!["settings", "login", "register"].includes(page as string) && <AccountIcon className={classes.itemIcon} />}  
            </Button>
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          {!loggedIn && (
            <>
              <Menu.Item onClick={() => navigate("/login")}>Login</Menu.Item>
              <Menu.Item onClick={() => navigate("/register")}>
                Sign Up
              </Menu.Item>
            </>
          )}
          {loggedIn && (
            <>
              <Menu.Item onClick={() => navigate("/settings")}>
                Settings
              </Menu.Item>
              <Menu.Item onClick={handleClickLogout}>Logout</Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </AppShell.Footer>
  );
};
