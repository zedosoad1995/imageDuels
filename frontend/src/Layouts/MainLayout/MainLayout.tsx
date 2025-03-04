import {
  AppShell,
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

  return (
    <AppShell header={{ height: 60 }} padding={{ sm: "lg", base: "sm" }}>
      <AppShell.Header>
        <Group h="100%" px={32} py={8}>
          <UnstyledButton className={classes.logoBtn} onClick={handleClickLogo}>
            <Logo height="70%" color={theme.colors.blue[6]} />
            <Text size="xl" fw={700}>
              IMAGE DUELS
            </Text>
          </UnstyledButton>
        </Group>
      </AppShell.Header>

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
