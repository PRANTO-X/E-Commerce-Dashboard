import axios from "axios";
import { getToken, clearAllAuthCookies } from "../auth/cookieService";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = token;
    }

    if (import.meta.env.DEV) {
      console.log("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log("API Response:", {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  (error) => {
    console.error("Response Error:", error);

    if (error.response?.status === 401) {
      clearAllAuthCookies();
      if (window.location.pathname !== "/sign-in") {
        window.location.href = "/sign-in";
      }
    }

    if (!error.response) {
      console.error("Network Error:", error.message);
    }

    return Promise.reject(error);
  }
);
