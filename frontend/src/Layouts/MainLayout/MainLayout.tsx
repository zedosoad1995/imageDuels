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
import { useEffect } from "react";

export const MainLayout = () => {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const handleClickLogo = () => {
    navigate("/");
  };

  const handleClickCreate = () => {
    navigate("/collection/create");
  };

  const handleClickMy = () => {
    navigate("/collections/me");
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
            <Button onClick={handleClickCreate}>Create Collection</Button>
            <Button onClick={handleClickMy} variant="subtle">
              My Collections
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
