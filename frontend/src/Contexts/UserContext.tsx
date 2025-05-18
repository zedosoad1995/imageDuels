import React, { createContext, useEffect, useState } from "react";
import { IUser } from "../Types/user";
import { getMe } from "../Api/users";
import { loginGoogle as loginAPI } from "../Api/auth";

interface UserProviderProps {
  children: React.ReactNode;
}

interface UserContextProps {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  loggedIn: boolean;
  isFetchingLoggedUser: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  login: () => Promise<void>;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  loggedIn: false,
  isFetchingLoggedUser: false,
  setLoggedIn: () => {},
  login: async () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isFetchingLoggedUser, setIsFetchingLoggedUser] = useState(false);

  useEffect(() => {
    setIsFetchingLoggedUser(true);
    getMe()
      .then((user) => {
        setUser(user);
        setLoggedIn(true);
      })
      .catch(() => {
        setUser(null);
        setLoggedIn(false);
      })
      .finally(() => {
        setIsFetchingLoggedUser(false);
      });
  }, []);

  const login = () => {
    loginAPI();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loggedIn,
        isFetchingLoggedUser,
        setLoggedIn,
        login,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
