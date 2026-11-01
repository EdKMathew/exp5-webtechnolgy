import axios from "axios";

// Set VITE_API_URL in .env (local) or in the Netlify/Vercel dashboard (live).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // lets the browser send the httpOnly login cookie
});

export default api;
