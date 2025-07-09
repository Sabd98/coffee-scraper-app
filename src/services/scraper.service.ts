import { writeFileSync } from "fs";
import { chromium } from "playwright";

export interface ScrapedProduct {
  title: string;
  price: number;
  url: string;
  delivery_city: string | undefined;
}

//Servise untuk scrape data dari Tokopedia
export const scrapeTokopedia = async (): Promise<ScrapedProduct[]> => {
  //state untuk mulai menjalankan
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-http2",
      `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36`,
    ],
  });

  //set context untuk konfigurasi
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
    extraHTTPHeaders: {
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: "https://www.google.com/",
    },
  });

  //inisiasi state untuk tambah halaman baru yang discrape
  const page = await context.newPage();

  try {
    //set url yang dituju
    console.log("Navigating to Tokopedia...");
    await page.goto("https://www.tokopedia.com/search?st=product&q=kopi", {
      waitUntil: "networkidle",
      timeout: 120000,
    });

    console.log("Page loaded. Taking screenshot...");
    await page.screenshot({ path: "page-loaded.png" });

    // Cek dan tutup popup jika ada
    try {
      await page.click('button[aria-label="Close"]', { timeout: 5000 });
      console.log("Closed popup");
    } catch {}

    console.log("Waiting for products...");

    // Fungsi untuk mengecek jumlah produk
    const checkProductCount = async () => {
      const items = await page.$$(".css-5wh65g, css-jza1fo");
      return items.length > 5;
    };

    let productsFound = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      if (await checkProductCount()) {
        productsFound = true;
        console.log(`Products found on attempt ${attempt + 1}`);
        break;
      }
      console.log(`Attempt ${attempt + 1}: Products not found yet, waiting...`);
      await page.waitForTimeout(3000);
    }

    if (!productsFound) {
      throw new Error("Products not found after 10 attempts");
    }

    // Simpan HTML untuk inspeksi
    const html = await page.content();
    writeFileSync("page-content.html", html);

    // Ekstrak produk dengan selector terbaru
    console.log("Extracting products data...");
    const products = await page.evaluate(() => {
      const containers = Array.from(
        document.querySelectorAll(".css-5wh65g, css-jza1fo")
      ).slice(0, 20);

      return containers.map((container) => {
        // Coba berbagai selector
        const titleElement = container.querySelector(
          "._0T8-iGxMpV6NEsYEhwkqEg\\=\\="
        );

        const extractPrice = () => {
          // Coba dua pola selector
          const priceElement =
            container.querySelector(
              "._67d6E1xDKIzw\\+i2D2L0tjw\\=\\=.t4jWW3NandT5hvCFAiotYg\\=\\="
            ) || container.querySelector("._67d6E1xDKIzw\\+i2D2L0tjw\\=\\=");

          const priceText = priceElement?.textContent?.trim();
          const cleanPrice = priceText
            ?.replace(/[^\d,]/g, "")
            .replace(",", "")
            .replace(/\./g, "");

          return parseInt(cleanPrice ?? "") || 0;
        };

        const linkElement = container.querySelector("a[href]");

        const getCity = () => {
          const flipElements = container.querySelectorAll('[class*="flip"]');
          if (flipElements.length >= 2) {
            return flipElements[1].textContent?.trim();
          }
          return "Unknown";
        };

        return {
          title: titleElement?.textContent?.trim() || "No title",
          price: extractPrice(),
          url: linkElement instanceof HTMLAnchorElement ? linkElement.href : "",
          delivery_city: getCity(),
        };
      });
    });
    console.log(`Extracted ${products.length} products`);
    console.log("Sample product:", products[0]);

    return products;
  } catch (error) {
    console.error("Scraping error:", error);
    return [];
  } finally {
    await browser.close();
  }
};

