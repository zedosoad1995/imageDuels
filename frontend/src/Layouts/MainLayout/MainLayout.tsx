import { AppShell } from "@mantine/core";
import { Outlet } from "react-router";
import classes from "./MainLayout.module.css";

export const MainLayout = () => {
  return (
    <AppShell padding={{ sm: "lg", base: "sm" }}>
      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
