"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { axiosErrorHandler } from "@/lib/axiosErrorHandler";

export default function ScrapePage() {
  //State scrape
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<{
    success: boolean;
    count?: number;
    error?: string;
  } | null>(null);
  const router = useRouter();

  //Trigger untuk mulai scrape
  const handleScrape = useCallback(async () => {
    setIsScraping(true);
    setScrapeResult(null);

    try {
      //Jalankan api server untuk scare dengan mengambil data di tokopedia secara scrape
      const response = await api.get("/api/scrape");
      setScrapeResult(response.data);

      // Refresh halaman produk setelah scraping
      setTimeout(() => router.refresh(), 2000);
    } catch (error) {
      const errorMessage = axiosErrorHandler(error);
      setScrapeResult({
        success: false,
        error: errorMessage, 
      });
    } finally {
      setIsScraping(false);
    }
  }, [router]);

  return (
    <section className="container mx-auto p-4">
      <nav className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tokopedia Scraper</h1>
        {/* tombol untuk menjalankan scraping data dari tokopedia */}
        <Button
          onClick={handleScrape}
          disabled={isScraping}
          className="hover:shadow-md border border-amber-950 "
          variant="outline"
        >
          {isScraping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Scrape Products
            </>
          )}
        </Button>
      </nav>

      {/* Notif status hasil scraping */}
      {scrapeResult && (
        <div
          className={`p-4 rounded-lg ${
            scrapeResult.success
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {scrapeResult.success ? (
            <p>Successfully scraped {scrapeResult.count} products!</p>
          ) : (
            <p>Error: {scrapeResult.error}</p>
          )}
        </div>
      )}

      {/* Detail Data yang discraping */}
      <article className="mt-8 ">
        <h2 className="text-xl font-semibold mb-4">Scraping Details</h2>
        <ul className="space-y-2">
          <li>
            <strong>Target:</strong> Tokopedia
          </li>
          <li>
            <strong>Keyword:</strong> &quot;kopi&quot;
          </li>
          <li>
            <strong>Scope:</strong> First page only
          </li>
          <li>
            <strong>Data Collected:</strong> Title, Price, URL, Delivery City
          </li>
        </ul>
      </article>
    </section>
  );
}
