import axios from "axios";

const rawUrl = process.env.NEXT_PUBLIC_API_URL;
const baseURL =
  !rawUrl || rawUrl.includes("localhost:3001")
    ? "/api"
    : rawUrl.endsWith("/api")
    ? rawUrl
    : `${rawUrl.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL,
});

export default api;

