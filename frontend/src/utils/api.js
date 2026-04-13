import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) {
  console.error("❌ VITE_BACKEND_URL is not defined");
}

// Axios instance
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default API;