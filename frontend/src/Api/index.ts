import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { logout } from "./auth";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.location.href = "/";
      await logout();
    }

    throw error;
  }
);

export default api;
