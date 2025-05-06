import { AppShell } from "@mantine/core";
import { Outlet } from "react-router";
import classes from "./MainLayout.module.css";
import { Sidebar } from "./components/Sidebar/Sidebar";

export const MainLayout = () => {
  return (
    <AppShell
      navbar={{ width: 280, breakpoint: 1 }}
      padding={{ sm: "lg", base: "sm" }}
    >
      <Sidebar />

      <AppShell.Main className={classes.main}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
