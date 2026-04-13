import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

console.log('✅ API baseURL:', BASE_URL);

const API = axios.create({
  baseURL: BASE_URL,
});

export const getBackendUrl = () => BASE_URL;

export default API;
