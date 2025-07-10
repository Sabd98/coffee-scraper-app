// src/app/login/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/login", { email,password });

      if (response.data.success) {
        // Simpan user data di local storage (sementara)
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.location.href = "/"; 
      } else {
        setError(response.data.error || "Login failed");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="bg-orange-200 p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-2 font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-amber-700 text-white py-2 rounded ${
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-amber-800"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
          //   Dummy credentials: <br />
          //   <span className="font-mono">user@example.com / password123</span>
          // </p> 
        </div> */}
      </div>
    </div>
  );
}
