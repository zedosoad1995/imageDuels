import api from ".";

// TODO: This returns password, do not include password (nor id?)
export const register = (username: string, email: string, password: string) => {
  return api.post("/users", {
    username,
    email,
    password,
  });
};

export const logout = (): Promise<void> => {
  return api.post("/auth/logout");
};
