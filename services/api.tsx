import axios from "axios";
import { tokenStorage } from "./tokenStorage";

const api = axios.create({
  baseURL: "https://api.dev.iziclub.fr/api/v1/",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    // 1. Récupère le token dynamiquement depuis le stockage persistant
    const token = await tokenStorage.getToken();

    // 2. Si le token existe, on l'ajoute au header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("➡️ REQUEST:", config.method?.toUpperCase(), config.url);
    console.log("URL:", config.url);
    console.log("METHOD:", config.method);
    console.log("DATA:", config.data);
    console.log("PARAMS:", config.params);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;