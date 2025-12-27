import { AppShell, Button, Modal, Stack, TextInput } from "@mantine/core";
import { Outlet, useNavigate } from "react-router";
import classes from "./MainLayout.module.css";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { useCallback, useContext, useState } from "react";
import { UserContext } from "../../Contexts/UserContext";
import debounce from "lodash.debounce";
import { checkUsername, completeRegistration } from "../../Api/users";
import { useMediaQuery } from "@mantine/hooks";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { MEDIA_QUERY_DESKTOP } from "../../Utils/breakpoints";

export const MainLayout = () => {
  const { user, logout, setUser } = useContext(UserContext);
  const isLaptopOrTablet = useMediaQuery(MEDIA_QUERY_DESKTOP);

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [isUniqueUsername, setIsUniqueUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const handleCloseSetupModal = async () => {
    await logout();
    navigate("/");
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = event.currentTarget.value.trim();

    if (newUsername.length < 3) {
      setUsernameError("must have at least 3 character");
    } else if (newUsername.length > 20) {
      setUsernameError("can have at most 20 characters");
    } else if (!/^[^\s]+$/.test(username)) {
      setUsernameError("cannot have white spaces");
    } else {
      setUsernameError("");
      setIsUniqueUsername(false);
      debouncedUpdateUser(newUsername);
    }

    setUsername(newUsername);
  };

  const debouncedUpdateUser = useCallback(
    debounce(
      async (username: string) => {
        const { exists } = await checkUsername(username);
        if (exists) {
          setUsernameError("username already exists");
          setIsUniqueUsername(false);
        } else {
          setIsUniqueUsername(true);
        }
      },
      500,
      {
        leading: true,
        trailing: true,
      }
    ),
    []
  );

  const handleRegister = async () => {
    const completedUser = await completeRegistration(username);
    setUser(completedUser);
  };

  // TODO: whem resizing and it changes layout, it makes new api calls

  if (isLaptopOrTablet) {
    return (
      <>
        <AppShell
          navbar={{ width: 60, breakpoint: 1 }}
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
              value={username}
              onChange={handleUsernameChange}
              error={usernameError}
            />
            <Button
              loaderProps={{ type: "dots" }}
              disabled={!!usernameError || !isUniqueUsername}
              onClick={handleRegister}
            >
              Complete setup
            </Button>
          </Stack>
        </Modal>
      </>
    );
  }

  return (
    <>
      <AppShell padding="xs" footer={{ height: 50 }} header={{ height: 48 }}>
        <Header />
        <AppShell.Main className={classes.main}>
          <Outlet />
        </AppShell.Main>
        <Footer />
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
            value={username}
            onChange={handleUsernameChange}
            error={usernameError}
          />
          <Button
            loaderProps={{ type: "dots" }}
            disabled={!!usernameError || !isUniqueUsername}
            onClick={handleRegister}
          >
            Complete setup
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
