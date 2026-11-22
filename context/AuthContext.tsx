import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { loginUser, logoutUser } from "../services/auth";
import { tokenStorage } from "../services/tokenStorage";

type AuthContextType = {
  user: any;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Charger le token au démarrage de l'application
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedUser = await SecureStore.getItemAsync('user_data');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          const token = parsedUser?.token ?? (await tokenStorage.getToken());
          if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        } else {
          const storedToken = await tokenStorage.getToken();
          if (storedToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          }
        }
      } catch (e) {
        console.error("Échec du chargement du token", e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    // Ton service auth.ts doit retourner les données utilisateur + le token

    const userData = await loginUser(email, password);
    
    // Sauvegarde persistante
    await SecureStore.setItemAsync('user_data', JSON.stringify(userData));
    
    // Mise à jour de l'état et d'Axios
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const logout = async () => {
    // La déconnexion locale doit toujours aboutir, même si le serveur refuse l'appel
    // (session expirée, compte supprimé, pas de réseau).
    try {
      await logoutUser();
    } catch {
      // Rien à faire : on nettoie quand même la session locale ci-dessous.
    }
    try {
      await SecureStore.deleteItemAsync('user_data');
    } catch {
      // Stockage indisponible : la session en mémoire est tout de même fermée.
    }
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};