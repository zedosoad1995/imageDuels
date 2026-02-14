import React, { createContext, useState } from "react";

export type PageName =
  | "feed"
  | "collections"
  | "create-collection"
  | "my-collections"
  | "settings"
  | "login"
  | "register"
  | "collection"
  | "banned";

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
