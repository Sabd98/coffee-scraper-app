// src/components/layout/AuthLayout.tsx
"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ReactNode, useEffect } from "react";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (!isLoading) {
      // Jika sudah login dan sedang di halaman login, redirect ke home
      if (isAuthenticated && isLoginPage) {
        router.replace("/");
      }
      // Jika belum login dan bukan di halaman login, redirect ke login
      else if (!isAuthenticated && !isLoginPage) {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  if (isLoading || (!isAuthenticated && !isLoginPage)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      {!isLoginPage && <Header />}
      <main className="flex-grow bg-amber-100">{children}</main>
      {!isLoginPage && <Footer />}
    </>
  );
}
