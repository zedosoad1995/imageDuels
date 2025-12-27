import { AppShell, Tooltip, UnstyledButton } from "@mantine/core";
import classes from "./Sidebar.module.css";
import ExploreIcon from "../../../../assets/svgs/explore.svg?react";
import ExploreFillIcon from "../../../../assets/svgs/explore-fill.svg?react";
import CollectionsIcon from "../../../../assets/svgs/collections.svg?react";
import CollectionsFillIcon from "../../../../assets/svgs/collections-fill.svg?react";
import DuelIcon from "../../../../assets/svgs/duel.svg?react";
import DuelFillIcon from "../../../../assets/svgs/duel-fill.svg?react";
import AddIcon from "../../../../assets/svgs/add-box.svg?react";
import AddFillIcon from "../../../../assets/svgs/add-box-fill.svg?react";
import SettingsIcon from "../../../../assets/svgs/settings.svg?react";
import SettingsFillIcon from "../../../../assets/svgs/settings-fill.svg?react";
import LogoutIcon from "../../../../assets/svgs/logout.svg?react";
import LoginIcon from "../../../../assets/svgs/account.svg?react";
import LoginFillIcon from "../../../../assets/svgs/account-fill.svg?react";
import { useNavigate, useLocation } from "react-router";
import { useContext } from "react";
import { UserContext } from "../../../../Contexts/UserContext";
import { usePage } from "../../../../Hooks/usePage";

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const page = usePage();

  const { loggedIn, logout } = useContext(UserContext);

  const handleClickLogo = () => {
    navigate("/");
  };

  const handleClickFeed = () => {
    navigate("/feed");
  };

  const handleClickCreate = () => {
    // TODO: open modal when use not logged
    navigate("/collections/create");
  };

  const handleClickCollections = () => {
    navigate("/collections");
  };

  const handleClickMy = () => {
    navigate("/collections/me");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleClickLogout = async () => {
    await logout();
    if (location.pathname !== "/") {
      navigate("/");
    }
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
          >
            {page === "collections" && <ExploreFillIcon className={classes.itemIcon} />}
            {page !== "collections" && <ExploreIcon className={classes.itemIcon} />}
          </UnstyledButton>
        </Tooltip>

        <Tooltip position="right" label="Duels">
          <UnstyledButton
            className={classes.item}
            onClick={handleClickFeed}
          >
            {page === "feed" && <DuelFillIcon className={classes.itemIcon} />}
            {page !== "feed" && <DuelIcon className={classes.itemIcon} />}
          </UnstyledButton>
        </Tooltip>

        <Tooltip position="right" label="Create Collection">
          <UnstyledButton
            className={classes.item}
            onClick={handleClickCreate}
          >
            {page === "create-collection" && <AddFillIcon className={classes.itemIcon} />}
            {page !== "create-collection" && <AddIcon className={classes.itemIcon} />}
          </UnstyledButton>
        </Tooltip>
        {loggedIn && (
          <Tooltip position="right" label="My Collections">
            <UnstyledButton
              className={classes.item}
              onClick={handleClickMy}
            >
              {page === "my-collections" && <CollectionsFillIcon className={classes.itemIcon} />}
              {page !== "my-collections" && <CollectionsIcon className={classes.itemIcon} />}
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
              >
                {page === "settings" && <SettingsFillIcon className={classes.itemIcon} />}
                {page !== "settings" && <SettingsIcon className={classes.itemIcon} />}
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
                {["login", "register"].includes(page) && <LoginFillIcon className={classes.itemIcon} />}
                {!["login", "register"].includes(page) && <LoginIcon className={classes.itemIcon} />}
              </UnstyledButton>
            </Tooltip>
          </>
        )}
      </div>
    </AppShell.Navbar>
  );
};
