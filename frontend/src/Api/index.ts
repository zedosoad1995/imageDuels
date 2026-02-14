import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { logout } from "./auth";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?.skipLogoutOn401) {
      window.location.href = "/";
      await logout();
    }

    // Check for banned user error
    if (error.response?.status === 403) {
      const errorData = error.response.data as any;
      if (
        errorData?.code === 'USER_BANNED'
      ) {
        window.location.href = "/banned";
        return;
      }
    }

    throw error;
  }
);

export default api;
