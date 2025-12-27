import { AppShell, Title, UnstyledButton } from "@mantine/core";
import classes from "./Header.module.css";
import { useNavigate } from "react-router";
import { usePage } from "../../../../Hooks/usePage";
import { useMemo } from "react";
import { PageName } from "../../../../Contexts/PageContext";

export const Header = () => {
  const navigate = useNavigate();
  const page = usePage();

  const handleClickLogo = async () => {
    navigate("/");
  };

  const pageName = useMemo(() => {
    if (!page) {
      return "Image Duels";
    }

    const pageLabelMap: Record<PageName, string> = {
      settings: "Settings",
      login: "Login",
      register: "Sign Up",
      feed: "Duels",
      collections: "Collections",
      "my-collections": "My Collections",
      "create-collection": "New Collection",
    };

    return pageLabelMap[page];
  }, [page]);

  return (
    <AppShell.Header className={classes.base}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 6 }}
        onClick={handleClickLogo}
      >
        <UnstyledButton style={{ position: "relative", top: -3 }}>
          <img src="/my-logo.svg" style={{ width: 30, display: "block" }} />
        </UnstyledButton>
        <Title
          style={{ position: "relative", top: 2, cursor: "pointer", marginLeft: 4 }}
          size={24}
        >
          {pageName}
        </Title>
      </div>
    </AppShell.Header>
  );
};
