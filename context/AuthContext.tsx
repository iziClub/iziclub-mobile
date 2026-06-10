import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { loginUser } from "../services/auth";

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
          // Configurer Axios avec le token stocké
          axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
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
    await SecureStore.deleteItemAsync('user_data');
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