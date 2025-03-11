const isDev = import.meta.env.DEV;
const apiPort = import.meta.env.VITE_API_PORT || 3002;

// In development, use localhost. In production, use relative path
export const API_URL = isDev 
  ? `http://localhost:${apiPort}/api`
  : '/api'; 