import api from ".";
import { IEditUserBody, IUser } from "../Types/user";

export const getMe = (): Promise<IUser> => {
  return api.get("/users/me");
};

export const checkUsername = (
  username: string
): Promise<{ exists: boolean }> => {
  return api.get("/users/check-username", { params: { username } });
};

export const completeRegistration = (username: string): Promise<IUser> => {
  return api.patch("/users/complete-registration", {
    username,
  });
};

export const editMe = (body: IEditUserBody): Promise<IUser> => {
  return api.patch("/users/me", body);
};

export const deleteMe = (): Promise<void> => {
  return api.delete("/users/me");
};

export const banUser = (userId: string): Promise<void> => {
  return api.put(`/users/${userId}/ban`);
};
