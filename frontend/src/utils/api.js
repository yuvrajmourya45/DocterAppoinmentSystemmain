const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const getBackendUrl = () => API_URL;

export default API_URL;
