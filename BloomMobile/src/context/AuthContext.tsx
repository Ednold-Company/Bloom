import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

interface AuthContextValue {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  anonymous: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("bloom_token").then((stored) => {
      if (stored) setToken(stored);
    });
  }, []);

  const saveToken = async (value: string | null) => {
    if (value) {
      await AsyncStorage.setItem("bloom_token", value);
    } else {
      await AsyncStorage.removeItem("bloom_token");
    }
    setToken(value);
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    await saveToken(response.data.token);
  };

  const signup = async (email: string, password: string) => {
    const response = await api.post("/auth/register", { email, password });
    await saveToken(response.data.token);
  };

  const anonymous = async () => {
    const response = await api.post("/auth/anonymous");
    await saveToken(response.data.token);
  };

  const logout = async () => {
    await saveToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, signup, anonymous, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
