import api from ".";

export const login = (email: string, password: string): Promise<void> => {
  return api.post("/auth/login", {
    email,
    password,
  });
};

// TODO: This returns password, do not include password (nor id?)
export const register = (email: string, password: string) => {
  return api.post("/users", {
    email,
    password,
  });
};
