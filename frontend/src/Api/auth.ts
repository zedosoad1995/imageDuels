import api from ".";

export const logout = (): Promise<void> => {
  return api.post("/auth/logout");
};
