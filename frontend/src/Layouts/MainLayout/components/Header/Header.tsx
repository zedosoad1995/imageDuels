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
      collection: "Collection",
    };

    return pageLabelMap[page];
  }, [page]);

  return (
    <AppShell.Header className={classes.base}>
      <div className={classes.container} onClick={handleClickLogo}>
        <UnstyledButton className={classes.logoButton}>
          <img
            src="/my-logo.svg"
            style={{
              width: 30,
              height: 30,
              display: "block",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
            }}
          />
        </UnstyledButton>
        <Title
          style={{
            cursor: "pointer",
            fontSize: "20px",
            fontWeight: 600,
            color: "#0f172a",
            letterSpacing: "-0.025em",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {pageName}
        </Title>
      </div>
    </AppShell.Header>
  );
};
