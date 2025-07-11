"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("authToken");

      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Set header Authorization untuk request ini
      const config = {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      };

      const response = await api.get("/api/auth/me", config);

      if (response.data.success) {
        setUser(response.data.user);
        setToken(storedToken);
        // Update header default
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem("authToken");
      }
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
        }
      } else if (error instanceof Error) {
        console.error("Authentication error:", error.message);
      } else {
        // Handle non-Error objects
        console.error("Unexpected authentication error:", error);
      }

      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("authToken", authToken);

    // SET HEADER DEFAULT UNTUK SEMUA REQUEST
    api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
