import api from ".";

export const getMe = (): Promise<{ id: string; email: string }> => {
  return api.get("/users/me");
};
