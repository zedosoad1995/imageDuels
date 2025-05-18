import api from ".";

export const loginGoogle = () => {
  // TODO: maybe open another window?
  window.location.href = import.meta.env.VITE_API_URL + "/auth/google";
};

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
