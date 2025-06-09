import { useContext, useEffect } from "react";
import { PageContext, PageName } from "../Contexts/PageContext";

export const usePage = (name?: PageName) => {
  const { page, setPage } = useContext(PageContext);

  useEffect(() => {
    if (!name) return;

    setPage(name);
  }, [name]);

  return page;
};
