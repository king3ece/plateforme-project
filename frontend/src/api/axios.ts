import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9091/api",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug: log outgoing request and Authorization header to help trace 403
    try {
      console.debug("API Request:", {
        url: config.url,
        method: config.method,
        authorization: config.headers?.Authorization,
      });
    } catch (e) {
      // ignore logging errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    // Debug logging to help identify failing API calls (status, url, body)
    try {
      console.error("API Error:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
      });
    } catch (e) {
      console.error("Error logging API error", e);
    }

    // If the backend rejects the token (401), clear auth and go to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Use replace to avoid polluting history
      window.location.href = "/login";
    }

    // Provide clearer message for 403 to help debugging
    if (error.response?.status === 403) {
      console.warn("API returned 403 Forbidden for:", error.config?.url);
      // Optional: surface a toast or UI signal here in future
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
