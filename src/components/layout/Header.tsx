'use client';
import Link from "next/link";
import { Home, Coffee, BarChart2, Users, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="bg-amber-950 text-white">
      <div className="mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold flex items-center">
          <Coffee className="mr-2" /> CoffeeScraper
        </Link>

        <nav className="hidden sm:flex space-x-6">
          <Link href="/" className="flex items-center hover:text-gray-300">
            <Home className="mr-1 h-4 w-4" /> Home
          </Link>
          <Link href="/users" className="flex items-center hover:text-gray-300">
            <Users className="mr-1 h-4 w-4" /> User
          </Link>
          <Link
            href="/products"
            className="flex items-center hover:text-gray-300"
          >
            <Coffee className="mr-1 h-4 w-4" /> Product
          </Link>
          <Link
            href="/scrape"
            className="flex items-center hover:text-gray-300"
          >
            <Coffee className="mr-1 h-4 w-4" /> Scraping
          </Link>
          <Link href="/stats" className="flex items-center hover:text-gray-300">
            <BarChart2 className="mr-1 h-4 w-4" /> Dashboard
          </Link>
        </nav>
        {isAuthenticated ? (
          <nav className="px-2 py-1 block md:flex items-center gap-4">
            <span className="hidden sm:inline font-bold">Hi, {user?.name}</span>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-orange-900"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </nav>
        ) : (
          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-gray-700"
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
