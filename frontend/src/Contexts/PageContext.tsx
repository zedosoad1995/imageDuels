import React, { createContext, useState } from "react";

type PageName = "explore" | "create-collection" | "my-collections" | "settings";

interface PageProviderProps {
  children: React.ReactNode;
}

interface PageContextProps {
  page: PageName | null;
  setPage: React.Dispatch<React.SetStateAction<PageName | null>>;
}

export const PageContext = createContext<PageContextProps>({
  page: null,
  setPage: () => {},
});

export const PageProvider = ({ children }: PageProviderProps) => {
  const [page, setPage] = useState<PageName | null>(null);

  return (
    <PageContext.Provider
      value={{
        page,
        setPage,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};
