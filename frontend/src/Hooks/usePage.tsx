import { useContext, useEffect } from "react";
import { PageContext } from "../Contexts/PageContext";

type PageName = "explore" | "create-collection" | "my-collections" | "settings";

export const usePage = (name?: PageName) => {
  const { page, setPage } = useContext(PageContext);

  useEffect(() => {
    if (!name) return;

    setPage(name);
  }, [name]);

  return page;
};
