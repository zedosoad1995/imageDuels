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
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          transition: "opacity 0.2s ease",
        }}
        onClick={handleClickLogo}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <UnstyledButton
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "12px",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(59, 130, 246, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
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
