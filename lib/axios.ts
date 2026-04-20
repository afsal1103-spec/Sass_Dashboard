import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8081/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to add the JWT token to headers
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401/403 errors
let isRedirecting = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      // Don't redirect if it's a 403 on a POST/PUT/DELETE, as it might be a logic error, not auth expiry
      const isAuthError = error.response?.status === 401;
      const isForbidden = error.response?.status === 403;
      const isDataModifyingRequest = ["post", "put", "delete"].includes(error.config?.method?.toLowerCase() || "");

      if ((isAuthError || (isForbidden && !isDataModifyingRequest)) && !isRedirecting) {
        console.error("Auth session expired or invalid. Redirecting to login...");
        isRedirecting = true;
        localStorage.removeItem("token");
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
