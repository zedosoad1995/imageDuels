import api from ".";
import { IUser } from "../Types/user";

export const getMe = (): Promise<IUser> => {
  return api.get("/users/me");
};
