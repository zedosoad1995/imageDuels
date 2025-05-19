import React, { createContext, useEffect, useMemo, useState } from "react";
import { IUser } from "../Types/user";
import { getMe } from "../Api/users";
import { logout as logoutAPI } from "../Api/auth";

interface UserProviderProps {
  children: React.ReactNode;
}

interface UserContextProps {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  loggedIn: boolean;
  isFetchingLoggedUser: boolean;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  loggedIn: false,
  isFetchingLoggedUser: false,
  logout: async () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isFetchingLoggedUser, setIsFetchingLoggedUser] = useState(false);

  useEffect(() => {
    setIsFetchingLoggedUser(true);
    getMe()
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsFetchingLoggedUser(false);
      });
  }, []);

  const logout = async () => {
    await logoutAPI();
    setUser(null);
  };

  const loggedIn = useMemo(() => !!user, [user]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loggedIn,
        isFetchingLoggedUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
