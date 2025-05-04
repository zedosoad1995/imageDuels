import api from ".";
import { IEditUserBody, IUser } from "../Types/user";

export const getMe = (): Promise<IUser> => {
  return api.get("/users/me");
};

export const editMe = (body: IEditUserBody): Promise<IUser> => {
  return api.patch("/users/me", body);
};

export const deleteMe = (): Promise<void> => {
  return api.delete("/users/me");
};
