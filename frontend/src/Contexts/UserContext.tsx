import React, { createContext, useEffect, useState } from "react";
import { IUser } from "../Types/user";
import { getMe } from "../Api/users";

interface UserProviderProps {
  children: React.ReactNode;
}

interface UserContextProps {
  user: IUser | null;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UserContext = createContext<UserContextProps>({
  user: null,
  setUser: () => {},
  loggedIn: false,
  setLoggedIn: () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    getMe()
      .then((user) => {
        setUser(user);
        setLoggedIn(true);
      })
      .catch(() => {
        setUser(null);
        setLoggedIn(false);
      });
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loggedIn, setLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};
