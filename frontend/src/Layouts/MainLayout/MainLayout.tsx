import {
  AppShell,
  Button,
  Group,
  Text,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { Outlet, useNavigate } from "react-router";
import classes from "./MainLayout.module.css";
import Logo from "../../assets/svgs/logo.svg?react";
import { logout } from "../../Api/auth";
import { useContext } from "react";
import { UserContext } from "../../Contexts/UserContext";

export const MainLayout = () => {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const { loggedIn, setUser, setLoggedIn } = useContext(UserContext);

  const handleClickLogo = () => {
    navigate("/");
  };

  const handleClickCreate = () => {
    navigate("/collections/create");
  };

  const handleClickMy = () => {
    navigate("/collections/me");
  };

  const handleClickLogout = async () => {
    await logout();
    setUser(null);
    setLoggedIn(false);
    navigate("/");
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  return (
    <AppShell header={{ height: 60 }} padding={{ sm: "lg", base: "sm" }}>
      <AppShell.Header>
        <Group h="100%" px={32} py={8} justify="space-between">
          <UnstyledButton className={classes.logoBtn} onClick={handleClickLogo}>
            <Logo height="70%" color={theme.colors.blue[6]} />
            <Text size="xl" fw={700}>
              IMAGE DUELS
            </Text>
          </UnstyledButton>
          <Group gap={8}>
            {loggedIn && (
              <>
                <Button onClick={handleClickCreate}>Create Collection</Button>
                <Button onClick={handleClickMy} variant="subtle">
                  My Collections
                </Button>
                <Button onClick={handleClickLogout} variant="subtle">
                  Logout
                </Button>
              </>
            )}
            {!loggedIn && (
              <>
                <Button onClick={handleGoToLogin}>Create Collection</Button>
                <Button onClick={handleGoToLogin} variant="subtle">
                  Login
                </Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
