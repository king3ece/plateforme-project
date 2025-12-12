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
        return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    
    // If the backend rejects the token (401), clear auth and go to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Use replace to avoid polluting history
      window.location.href = "/login";
    }

    
    return Promise.reject(error);
  }
);

export default axiosInstance;
