import { AppShell, Button, Modal, Stack, TextInput } from "@mantine/core";
import { Outlet, useNavigate } from "react-router";
import classes from "./MainLayout.module.css";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { useContext, useState } from "react";
import { UserContext } from "../../Contexts/UserContext";

export const MainLayout = () => {
  const { user, logout } = useContext(UserContext);

  const navigate = useNavigate();

  const [] = useState();

  const handleCloseSetupModal = async () => {
    await logout();
    navigate("/");
  };

  return (
    <>
      <AppShell
        navbar={{ width: 280, breakpoint: 1 }}
        padding={{ sm: "lg", base: "sm" }}
      >
        <Sidebar />

        <AppShell.Main className={classes.main}>
          <Outlet />
        </AppShell.Main>
      </AppShell>
      <Modal
        opened={!!user && !user.isProfileCompleted}
        onClose={handleCloseSetupModal}
        title="Complete Setup"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="Username"
            type="text"
            autoComplete="username"
            inputMode="text"
          />
          <Button loaderProps={{ type: "dots" }}>Complete setup</Button>
        </Stack>
      </Modal>
    </>
  );
};
