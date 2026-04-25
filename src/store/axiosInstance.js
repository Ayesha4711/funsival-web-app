import axios from "axios";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://funsival-backend-twvuq.ondigitalocean.app/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token before every request
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem("auth-token");
    if (!token) {
      const match = document.cookie.match(/(^|;)\s*auth-token\s*=\s*([^;]+)/);
      token = match ? match[2] : null;
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default axiosInstance;
