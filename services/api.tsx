import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { router } from "expo-router";
import { tokenStorage } from "./tokenStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL est manquant. Ajoutez-le à votre fichier .env (voir .env.example)."
  );
}

const api = axios.create({
  baseURL: API_URL,
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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      try {
        await tokenStorage.clearToken();
        await SecureStore.deleteItemAsync('user_data');
        delete api.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];
        // router.replace('/login');
      } catch (redirectError) {
        console.error('Erreur lors du traitement du 401 :', redirectError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;