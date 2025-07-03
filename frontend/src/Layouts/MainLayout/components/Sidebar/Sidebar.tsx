import { AppShell, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./Sidebar.module.css";
import ExploreIcon from "../../../../assets/svgs/explore.svg?react";
import CollectionsIcon from "../../../../assets/svgs/collections.svg?react";
import AddIcon from "../../../../assets/svgs/add-box.svg?react";
import SettingsIcon from "../../../../assets/svgs/settings.svg?react";
import LogoutIcon from "../../../../assets/svgs/logout.svg?react";
import LoginIcon from "../../../../assets/svgs/account.svg?react";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../../../../Contexts/UserContext";
import { usePage } from "../../../../Hooks/usePage";

export const Sidebar = () => {
  const navigate = useNavigate();
  const page = usePage();

  const { loggedIn, logout } = useContext(UserContext);

  const handleClickLogo = () => {
    navigate("/");
  };

  const handleClickCreate = () => {
    // TODO: open modal when use not logged
    navigate("/collections/create");
  };

  const handleClickMy = () => {
    navigate("/collections/me");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleClickLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <AppShell.Navbar className={classes.navbar}>
      <div
        style={{
          marginBottom: 16,
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UnstyledButton onClick={handleClickLogo}>
          <img src="/my-logo.svg" style={{ width: 30, display: "block" }} />
        </UnstyledButton>
      </div>
      <div className={classes.navbarMain}>
        <Tooltip position="right" label="Explore">
          <UnstyledButton
            className={classes.item}
            onClick={handleClickLogo}
            data-active={page === "explore" || undefined}
          >
            <ExploreIcon className={classes.itemIcon} />
          </UnstyledButton>
        </Tooltip>

        <Tooltip position="right" label="Create Collection">
          <UnstyledButton
            className={classes.item}
            onClick={handleClickCreate}
            data-active={page === "create-collection" || undefined}
          >
            <AddIcon className={classes.itemIcon} />
          </UnstyledButton>
        </Tooltip>
        {loggedIn && (
          <Tooltip position="right" label="My Collections">
            <UnstyledButton
              className={classes.item}
              onClick={handleClickMy}
              data-active={page === "my-collections" || undefined}
            >
              <CollectionsIcon className={classes.itemIcon} />
            </UnstyledButton>
          </Tooltip>
        )}
      </div>
      <div className={classes.footer}>
        {loggedIn && (
          <>
            <Tooltip position="right" label="Settings">
              <UnstyledButton
                className={classes.item}
                onClick={handleSettings}
                data-active={page === "settings" || undefined}
              >
                <SettingsIcon className={classes.itemIcon} />
              </UnstyledButton>
            </Tooltip>

            <Tooltip position="right" label="Logout">
              <UnstyledButton
                className={classes.item}
                onClick={handleClickLogout}
              >
                <LogoutIcon className={classes.itemIcon} />
              </UnstyledButton>
            </Tooltip>
          </>
        )}
        {!loggedIn && (
          <>
            <Tooltip position="right" label="Login">
              <UnstyledButton className={classes.item} onClick={handleLogin}>
                <LoginIcon className={classes.itemIcon} />
              </UnstyledButton>
            </Tooltip>
          </>
        )}
      </div>
    </AppShell.Navbar>
  );
};
