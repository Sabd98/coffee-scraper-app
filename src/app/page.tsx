
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Coffee, BarChart2, Scissors } from "lucide-react";
import "./globals.css";

//Halaman Utama,
export default function Home() {
  return (
    <section className=" container mx-auto p-4 text-center py-12">
      {/* Hero */}
      <h1 className="text-4xl font-bold mb-4">Welcome to the CoffeeScraper</h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Tokopedia&apos;s coffee product data analysis simple platform. Monitor
        prices, geographic distribution, and market trends for coffee products
        in Indonesia.
      </p>

      {/* Fitur Menu */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link href="/products">
          <article className="border border-amber-950 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Coffee className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">Coffee Products</h3>
            <p className="text-gray-600">View coffee product data</p>
          </article>
        </Link>

        <Link href="/scrape">
          <article className="border border-amber-950 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <Scissors className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-lg font-semibold mb-2">Scraping Data</h3>
            <p className="text-gray-600">Get the latest data from Tokopedia</p>
          </article>
        </Link>

        <Link href="/stats">
          <article className="border border-amber-950 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <BarChart2 className="h-12 w-12 mx-auto mb-4 text-purple-500" />
            <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
            <p className="text-gray-600">Price distribution analysis</p>
          </article>
        </Link>
      </section>

      {/* //Pintasan */}
      <nav className="flex justify-center space-x-4">
        <Button
          asChild
          className="hover:shadow-lg border border-amber-950"
          variant="outline"
        >
          <Link href="/scrape">Start Scraping</Link>
        </Button>
        <Button
          asChild
          className="hover:shadow-lg border border-amber-950"
          variant="outline"
        >
          <Link href="/stats">Check Dashboard</Link>
        </Button>
      </nav>
    </section>
  );
}
