import axios from "axios";

const api = axios.create({
  baseURL: "/",
});

api.interceptors.request.use((config) => {
  // Ambil token dari localStorage
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("No authToken found in localStorage");
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
