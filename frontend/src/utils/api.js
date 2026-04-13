import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://docterappoinmentsystemmain.onrender.com';

console.log('✅ API baseURL:', BASE_URL);
console.log('✅ ENV:', import.meta.env.VITE_BACKEND_URL);

const API = axios.create({
  baseURL: BASE_URL,
});

export const getBackendUrl = () => BASE_URL;

export default API;
