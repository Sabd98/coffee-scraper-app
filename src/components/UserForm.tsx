"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/context/UsersContext";
import axios from "axios"; // Import Axios

interface UserFormProps {
  mode: "create" | "edit";
  userId?: number;
}

export default function UserForm({ mode, userId }: UserFormProps) {
  const router = useRouter();
  const { createUser, updateUser, users } = useUsers();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load user data untuk edit mode menggunakan Axios
  useEffect(() => {
    if (mode === "edit" && userId) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setName(user.name);
        setEmail(user.email);
      } else {
        // Jika user tidak ditemukan di context, fetch dari API menggunakan Axios
        const fetchUser = async () => {
          setIsLoading(true);
          try {
            const response = await axios.get(`/api/users/${userId}`);
            setName(response.data.name);
            setEmail(response.data.email);
          } catch (err) {
            setError("Failed to load user data");
          } finally {
            setIsLoading(false);
          }
        };
        fetchUser();
      }
    }
  }, [mode, userId, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (mode === "create") {
        await createUser({ name, email });

        // Tunggu sebentar untuk memastikan state sudah diupdate
        await new Promise((resolve) => setTimeout(resolve, 100));

        router.push("/users");
        router.refresh(); // Refresh halaman untuk memastikan data terbaru
      } else if (mode === "edit" && userId) {
        await updateUser(userId, { name, email });
        router.push("/users");
      }
    } catch (err) {
      setError(typeof err === "string" ? err : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6">
        {mode === "create" ? "Create User" : "Edit User"}
      </h1>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-2 font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-2 font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push("/users")}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-600 text-white rounded transition-colors ${
              isSubmitting
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create"
              : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
