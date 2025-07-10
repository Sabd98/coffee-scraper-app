"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios"; // Import Axios

interface User {
  id: number;
  name: string;
  email: string;
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
      const response = await axios.get("/api/users");
      setUsers(response.data);
      setStatus("succeeded");
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching users"
      );
      setStatus("failed");
    }
  };

  const createUser = async (userData: Omit<User, "id">) => {
    setError(null);
    try {
      const response = await axios.post("/api/users", userData);

      if (response.status !== 201) {
        throw new Error("Failed to create user");
      }

      const newUser = response.data;

      // Pastikan newUser memiliki struktur yang benar
      if (!newUser.id || !newUser.name || !newUser.email) {
        throw new Error("Invalid user data returned from API");
      }

      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to create user";
      setError(errorMessage);
      throw errorMessage; 
    }
  };

  const updateUser = async (id: number, userData: Partial<User>) => {
    setError(null);
    try {
      const response = await axios.put(`/api/users/${id}`, userData);
      const updatedUser = response.data;
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to update user";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (id: number) => {
    setError(null);
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to delete user";
      setError(errorMessage);
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
