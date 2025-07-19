import { AppShell, UnstyledButton } from "@mantine/core";
import classes from "./Header.module.css";
import { useNavigate } from "react-router";

export const Header = () => {
  const navigate = useNavigate();

  const handleClickLogo = async () => {
    navigate("/");
  };

  return (
    <AppShell.Header className={classes.base}>
      <UnstyledButton onClick={handleClickLogo}>
        <img src="/my-logo.svg" style={{ width: 30, display: "block" }} />
      </UnstyledButton>
    </AppShell.Header>
  );
};
