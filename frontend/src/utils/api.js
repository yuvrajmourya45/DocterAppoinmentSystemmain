import axios from 'axios';

const BASE_URL = 'https://docterappoinmentsystemmain.onrender.com';

const API = axios.create({
  baseURL: BASE_URL,
});

export const getBackendUrl = () => BASE_URL;

export default API;
