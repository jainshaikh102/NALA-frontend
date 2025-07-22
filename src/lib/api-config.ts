import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/auth-store";

// Base URL - Use proxy in production to avoid mixed content issues
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api/proxy" // Use proxy in production
    : process.env.NEXT_PUBLIC_API_BASE_URL || "http://35.209.131.186:8002"; // Direct API in development

// Axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token from cookies
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 + refresh token flow
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = Cookies.get("refreshToken");

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token: newRefreshToken } = res.data;

          const { setAuth, user } = useAuthStore.getState();
          if (user) {
            setAuth(user, access_token, newRefreshToken);
          }

          Cookies.set("accessToken", access_token);
          Cookies.set("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          // On refresh failure
          const { clearAuth } = useAuthStore.getState();
          clearAuth();
          if (typeof window !== "undefined") {
            window.location.href = "/sign-in";
          }
          return Promise.reject(refreshError);
        }
      } else {
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// ✅ Error handler
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      message: error.response.data?.message || "An error occurred",
      status: error.response.status,
      errors: error.response.data?.errors,
    };
  } else if (error.request) {
    return {
      message: "Network error - please check your connection",
      status: 0,
    };
  } else {
    return {
      message: error.message || "Unexpected error",
      status: 0,
    };
  }
};
