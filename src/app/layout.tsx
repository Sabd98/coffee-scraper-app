//WebAppLayout Structure
import Link from "next/link";
import { Home, Coffee, BarChart2 } from "lucide-react";
import "./globals.css";
import { initDummyUser } from "@/lib/initDummyUser";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "CoffeeScraper",
  description: "Coffee Scraper Simple App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initDummyUser();
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          {/* Header Layout */}
          <header className="bg-amber-950 text-white  ">
            <div className=" mx-auto flex items-center justify-between p-4">
              <Link href="/" className="text-xl font-bold flex items-center">
                <Coffee className="mr-2" /> CoffeeScraper
              </Link>

              <nav className="hidden sm:block md:flex space-x-6 ">
                <Link
                  href="/"
                  className="flex items-center hover:text-gray-300"
                >
                  <Home className="mr-1 h-4 w-4" /> Home
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
                <Link
                  href="/stats"
                  className="flex items-center hover:text-gray-300"
                >
                  <BarChart2 className="mr-1 h-4 w-4" /> Dashboard
                </Link>
              </nav>
            </div>
          </header>

          {/* Content Layout */}
          <main className="flex-grow container mx-auto p-4">{children}</main>

          {/* //Footer Layout */}
          <footer className="bg-amber-950 text-white py-6">
            <div className="container mx-auto text-center">
              <p>
                © {new Date().getFullYear()} CoffeeScraper - Coffee Product Data
                Analysis
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
