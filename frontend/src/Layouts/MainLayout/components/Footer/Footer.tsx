import { AppShell, Button, Menu, Tooltip } from "@mantine/core";
import ExploreIcon from "../../../../assets/svgs/explore.svg?react";
import CollectionsIcon from "../../../../assets/svgs/collections.svg?react";
import AddIcon from "../../../../assets/svgs/add-box.svg?react";
import AccountIcon from "../../../../assets/svgs/account.svg?react";
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
          variant={page === "explore" ? "light" : "subtle"}
          className={classes.item}
          onClick={() => navigate("/")}
        >
          <ExploreIcon className={classes.itemIcon} />
        </Button>
      </Tooltip>

      <Tooltip position="top" label="Create Collection">
        <Button
          variant={page === "create-collection" ? "light" : "subtle"}
          className={classes.item}
          onClick={() => navigate("/collections/create")}
        >
          <AddIcon className={classes.itemIcon} />
        </Button>
      </Tooltip>

      {loggedIn && (
        <Tooltip position="top" label="My Collections">
          <Button
            variant={page === "my-collections" ? "light" : "subtle"}
            className={classes.item}
            onClick={() => navigate("/collections/me")}
          >
            <CollectionsIcon className={classes.itemIcon} />
          </Button>
        </Tooltip>
      )}
      <Menu shadow="md" width={150} position="top-start">
        <Menu.Target>
          <Tooltip position="top" label="Account">
            <Button
              variant={
                ["settings", "login", "register"].includes(page as string)
                  ? "light"
                  : "subtle"
              }
              className={classes.item}
            >
              <AccountIcon className={classes.itemIcon} />
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
