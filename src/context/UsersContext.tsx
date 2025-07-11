"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/axios";
import { axiosErrorHandler } from "@/lib/axiosErrorHandler";

interface User {
  id: number;
  name: string;
  email: string;
  password:string;
}

interface UsersContextType {
  users: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  setError: (error: string | null) => void;
  fetchUsers: () => Promise<void>;
  createUser: (userData: Omit<User, "id">) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
      setStatus("succeeded");
    } catch (error) {
      const errorMessage = axiosErrorHandler(error);
      setError(errorMessage ||
          "An error occurred while fetching users"
      );
      setStatus("failed");
    }
  };

  const createUser = async (userData: Omit<User, "id">) => {
    setError(null);
    try {
      const response = await api.post("/api/users", userData);

      if (response.status !== 201) {
        throw new Error("Failed to create user");
      }

      const newUser = response.data;

      // Pastikan newUser memiliki struktur yang benar
      if (!newUser.id || !newUser.name || !newUser.email || !newUser.password) {
        throw new Error("Invalid user data returned from API");
      }

      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (error) {
      const errorMessage = axiosErrorHandler(error);
      setError(errorMessage ||
          "An error occurred while fetching users"
      );
      throw errorMessage; 
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    setError(null);
    try {
      const response = await api.put(`/api/users/${id}`, userData);
      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (error) {
      const errorMessage = axiosErrorHandler(error);
      setError(errorMessage || "An error occurred while fetching users");
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (id: number) => {
    setError(null);
    try {
      await api.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      const errorMessage = axiosErrorHandler(error);
      setError(errorMessage || "An error occurred while fetching users");
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UsersContext.Provider
      value={{
        users,
        status,
        error,
        setError,
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}
