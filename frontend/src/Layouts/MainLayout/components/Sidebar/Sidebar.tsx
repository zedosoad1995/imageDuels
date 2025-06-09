import { AppShell, Text, UnstyledButton, useMantineTheme } from "@mantine/core";
import classes from "./Sidebar.module.css";
import Logo from "../../../../assets/svgs/logo.svg?react";
import ExploreIcon from "../../../../assets/svgs/explore.svg?react";
import CollectionsIcon from "../../../../assets/svgs/collections.svg?react";
import AddIcon from "../../../../assets/svgs/add-box.svg?react";
import SettingsIcon from "../../../../assets/svgs/settings.svg?react";
import LogoutIcon from "../../../../assets/svgs/logout.svg?react";
import LoginIcon from "../../../../assets/svgs/account.svg?react";
import SignUpIcon from "../../../../assets/svgs/sign-up.svg?react";
import { useNavigate } from "react-router";
import { useContext } from "react";
import { UserContext } from "../../../../Contexts/UserContext";
import { usePage } from "../../../../Hooks/usePage";

export const Sidebar = () => {
  const theme = useMantineTheme();
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
    // TODO: Login and register will hide side bar
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  return (
    <AppShell.Navbar className={classes.navbar}>
      <div className={classes.navbarMain}>
        {/* <div className={classes.header}>
          <UnstyledButton className={classes.logoBtn} onClick={handleClickLogo}>
            <Logo height={22} color={theme.colors.blue[6]} />
          </UnstyledButton>
        </div> */}
        <UnstyledButton
          className={classes.item}
          onClick={handleClickLogo}
          data-active={page === "explore" || undefined}
        >
          <ExploreIcon className={classes.itemIcon} />
        </UnstyledButton>
        <UnstyledButton
          className={classes.item}
          onClick={handleClickCreate}
          data-active={page === "create-collection" || undefined}
        >
          <AddIcon className={classes.itemIcon} />
        </UnstyledButton>
        {loggedIn && (
          <UnstyledButton
            className={classes.item}
            onClick={handleClickMy}
            data-active={page === "my-collections" || undefined}
          >
            <CollectionsIcon className={classes.itemIcon} />
          </UnstyledButton>
        )}
      </div>
      <div className={classes.footer}>
        {loggedIn && (
          <>
            <UnstyledButton
              className={classes.item}
              onClick={handleSettings}
              data-active={page === "settings" || undefined}
            >
              <SettingsIcon className={classes.itemIcon} />
            </UnstyledButton>
            <UnstyledButton
              className={classes.item}
              onClick={handleClickLogout}
            >
              <LogoutIcon className={classes.itemIcon} />
            </UnstyledButton>
          </>
        )}
        {!loggedIn && (
          <>
            <UnstyledButton className={classes.item} onClick={handleLogin}>
              <LoginIcon className={classes.itemIcon} />
            </UnstyledButton>
            <UnstyledButton className={classes.item} onClick={handleSignUp}>
              <SignUpIcon className={classes.itemIcon} />
            </UnstyledButton>
          </>
        )}
      </div>
    </AppShell.Navbar>
  );
};
