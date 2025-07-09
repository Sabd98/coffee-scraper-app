import { chromium } from "playwright";
import { Client } from "pg";
import { writeFileSync } from "fs";
import dotenv from "dotenv";
dotenv.config();

//testing scraping tanpa klik dari webapp
async function runScrape() {
  const browser = await chromium.launch({
    headless: false,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-http2",
      `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36`,
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
    extraHTTPHeaders: {
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Referer: "https://www.google.com/",
    },
  });

  const page = await context.newPage();

  try {
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
      ).slice(0, 10);

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

          if (!priceElement) {
            // Coba selector alternatif untuk harga normal
            const fallbackPriceElement = container.querySelector(
              "._67d6E1xDKIzw\\+i2D2L0tjw\\=\\="
            );

            if (fallbackPriceElement) {
              const priceText = fallbackPriceElement.textContent.trim();
              const cleanPrice = priceText
                .replace(/[^\d,]/g, "")
                .replace(",", "")
                .replace(/\./g, "");
              return parseInt(cleanPrice) || 0;
            }
            return 0;
          }

          const priceText = priceElement.textContent.trim();
          const cleanPrice = priceText
            .replace(/[^\d,]/g, "")
            .replace(",", "")
            .replace(/\./g, "");

          return parseInt(cleanPrice) || 0;
        };
 
        const linkElement = container.querySelector("a[href]");

        const getCity = () => {
          const flipElements = container.querySelectorAll('[class*="flip"]');
          if (flipElements.length >= 2) {
            return flipElements[1].textContent.trim();
          }
          return "Unknown";
        };

        return {
          title: titleElement?.textContent?.trim() || "No title",
          price: extractPrice(),
          url: linkElement?.href || "",
          delivery_city: getCity(),
        };
      });
    });

    console.log(`Extracted ${products.length} products`);
    console.log("Sample product:", products[0]);

    // Simpan ke database
    const client = new Client({
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      ssl: false,
    });

    await client.connect();
    console.log("Connected to database");

    // Hapus data lama
    await client.query("DELETE FROM products");
    console.log("Old products deleted");

    // Simpan data baru
    for (const [index, product] of products.entries()) {
      await client.query(
        `INSERT INTO products (title, price, url, delivery_city, scraped_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [product.title, product.price, product.url, product.delivery_city]
      );
      console.log(`Saved product ${index + 1}/${products.length}`);
      // await page.waitForTimeout(1000);

    }

    console.log(`Successfully saved ${products.length} products to database`);
    await client.end();
  } catch (error) {
    console.error("Scraping failed:", error);
    await page.screenshot({ path: "error.png" });
  } finally {
    await browser.close();
    console.log("Browser closed");
  }
}

runScrape();

// import { chromium } from "playwright";
// import { Client } from "pg";
// import { writeFileSync } from "fs";
// import dotenv from "dotenv";
// dotenv.config();

// async function runScrape() {
//   const browser = await chromium.launch({
//     headless: false,
//     args: [
//       "--disable-blink-features=AutomationControlled",
//       "--no-sandbox",
//       "--disable-http2",
//       `--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36`,
//     ],
//   });

//   const context = await browser.newContext({
//     viewport: { width: 1280, height: 800 },
//     locale: "id-ID",
//     timezoneId: "Asia/Jakarta",
//     extraHTTPHeaders: {
//       "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
//       Referer: "https://www.google.com/",
//     },
//   });

//   const page = await context.newPage();

//   try {
//     console.log("Navigating to Tokopedia...");
//     await page.goto("https://www.tokopedia.com/search?st=product&q=kopi", {
//       waitUntil: "networkidle",
//       timeout: 120000,
//     });

//     console.log("Page loaded. Taking screenshot...");
//     await page.screenshot({ path: "page-loaded.png" });

//     // Tutup popup jika ada
//     const closePopup = async () => {
//       const popupSelectors = [
//         'button[aria-label="Close"]',
//         ".unf-overlay__close",
//         ".btn-close",
//       ];
//       for (const selector of popupSelectors) {
//         try {
//           await page.click(selector, { timeout: 2000 });
//           console.log(`Closed popup with selector: ${selector}`);
//           return true;
//         } catch (error) {
//           // Lanjut ke selector berikutnya
//         }
//       }
//       return false;
//     };
//     await closePopup();

//     console.log("Waiting for products...");

//     // Fungsi untuk scroll halaman
//     const autoScroll = async () => {
//       await page.evaluate(async () => {
//         await new Promise((resolve) => {
//           let totalHeight = 0;
//           const distance = 500;
//           const timer = setInterval(() => {
//             const scrollHeight = document.body.scrollHeight;
//             window.scrollBy(0, distance);
//             totalHeight += distance;
//             if (totalHeight >= scrollHeight) {
//               clearInterval(timer);
//               resolve();
//             }
//           }, 100);
//         });
//       });
//     };

//     // Scroll halaman untuk memastikan produk terload
//     await autoScroll();
//     await page.waitForTimeout(3000);

//     // Fungsi untuk mengecek jumlah produk
//     const checkProductCount = async () => {
//       const items = await page.$$('[data-testid="divSRPContentProducts"]');
//       return items.length > 5;
//     };

//     let productsFound = false;
//     for (let attempt = 0; attempt < 10; attempt++) {
//       if (await checkProductCount()) {
//         productsFound = true;
//         console.log(`Products found on attempt ${attempt + 1}`);
//         break;
//       }
//       console.log(`Attempt ${attempt + 1}: Products not found yet, waiting...`);
//       await page.waitForTimeout(3000);
//     }

//     if (!productsFound) {
//       throw new Error("Products not found after 10 attempts");
//     }

//     // Simpan HTML untuk inspeksi
//     const html = await page.content();
//     writeFileSync("page-content.html", html);

//     // Ekstrak produk dengan multi-selector
//     console.log("Extracting products data...");
//     const products = await page.evaluate(() => {
//       // Fungsi helper untuk mencoba beberapa selector
//       const trySelectors = (element, selectors) => {
//         for (const selector of selectors) {
//           const target = element.querySelector(selector);
//           if (target && target.textContent.trim()) {
//             return target.textContent.trim();
//           }
//         }
//         return null;
//       };

//       // Container produk
//       const containerSelectors = [".css-5wh65g", ".css-jza1fo"];
//       const containers = [];
//       for (const selector of containerSelectors) {
//         const found = document.querySelectorAll(selector);
//         if (found.length > 0) {
//           containers.push(...Array.from(found));
//         }
//       }
//       // Batasi 20 produk
//       const slicedContainers = containers.slice(0, 20);

//       return slicedContainers.map((container) => {
//         // Selector untuk judul
//         const titleSelectors = [
//           "._0T8-iGxMpV6NEsYEhwkqEg\\=\\=",
//           "._6\\+OpBPVGAgqnmycna+bWIw\\=\\=",
//           ".WABnq4pXOYQihv0hUfQwOg\\=\\=.",
//           ".bYD8FcVCFyOBiVyITwDj1Q\\=\\=",
//           'span[class*="_0T8"]', // Berdasarkan pola class Anda
//           "div > div > div > span", // Berdasarkan struktur
//         ];
//         const title = trySelectors(container, titleSelectors) || "No title";

//         // Fungsi ekstraksi harga
//         const extractPrice = () => {
//           const priceSelectors = [
//             ".bYD8FcVCFyOBiVyITwDj1Q\\=\\=",
//             ".WABnq4pXOYQihv0hUfQwOg\\=\\=.",
//             "._67d6E1xDKIzw\\+i2D2L0tjw\\=\\=.t4jWW3NandT5hvCFAiotYg\\=\\=",
//             ".XvaCkHiisn2EZFq0THwVug\\=\\=",
//             'div[class*="_67d6"]',
//           ];

//           let priceText = "";
//           for (const selector of priceSelectors) {
//             const element = container.querySelector(selector);
//             if (element?.textContent?.trim()) {
//               priceText = element.textContent.trim();
//               break;
//             }
//           }

//           if (!priceText) return 0;

//           // Handle berbagai format harga
//           const cleanPrice = priceText
//             .split("-")[0]
//             .replace(/[^\d,]/g, "")
//             .replace(",", "")
//             .replace(/\./g, "");
//           return parseInt(cleanPrice) || 0;
//         };

//         // URL
//         const linkElement = container.querySelector("a[href]");
//         const url = linkElement ? linkElement.href : "";

//         // Fungsi ekstraksi kota
//         const extractCity = () => {
//           const citySelectors = [
//             ".bYD8FcVCFyOBiVyITwDj1Q\\=\\=",
//             ".WABnq4pXOYQihv0hUfQwOg\\=\\=.",
//             ".Jh7geoVa-F3B5Hk8ORh2qw\\=\\=",
//             ".pC8DMVkBZGW7-egObcWMFQ\\=\\=.flip",
//             ".bi73OIBbtCeigSPpdXXfdw\\=\\=",
//             '[class*="Flip"]',
//           ];

//           // Coba berbagai selector
//           let cityText = "";
//           for (const selector of citySelectors) {
//             const element = container.querySelector(selector);
//             if (element?.textContent?.trim()) {
//               cityText = element.textContent.trim();
//               break;
//             }
//           }

//           if (!cityText) return "Unknown";

//           // Cari elemen dengan class yang mengandung "flip" (untuk pendekatan spesifik)
//           const flipElements = container.querySelectorAll('[class*="flip"]');
//           if (flipElements.length >= 2) {
//             return flipElements[1].textContent.trim();
//           }

//           // Fallback ke pemrosesan teks
//           const cityMatch = cityText.match(
//             /(Jakarta|Bekasi|Bandung|Surabaya|Medan|Semarang|Yogyakarta|Denpasar|Makassar|Palembang|Batam|Bogor|Malang|Balikpapan|Pekanbaru|Tangerang|Bandar Lampung|Padang|Samarinda|Banjarmasin|Banyumas|Banyuwangi|Kota [A-Za-z]+|Kab\. [A-Za-z]+)/i
//           );

//           return cityMatch ? cityMatch[0] : "Unknown";
//         };

//         return {
//           title,
//           price: extractPrice(),
//           url,
//           delivery_city: extractCity(),
//         };
//       });
//     });

//     console.log(`Extracted ${products.length} products`);
//     console.log("Sample product:", products[0]);

//     // Simpan ke database
//     const client = new Client({
//       user: process.env.DB_USER,
//       database: process.env.DB_NAME,
//       password: process.env.DB_PASSWORD,
//       host: process.env.DB_HOST,
//       port: process.env.DB_PORT,
//       ssl: false,
//     });

//     await client.connect();
//     console.log("Connected to database");

//     // Hapus data lama
//     await client.query("DELETE FROM products");
//     console.log("Old products deleted");

//     // Simpan data baru, hanya untuk produk yang valid
//     let savedCount = 0;
//     for (const [index, product] of products.entries()) {
//       // Skip produk tanpa judul atau harga 0
//       if (product.title === "No title" || product.price === 0) {
//         console.log(`Skipping invalid product: ${product.title}`);
//         continue;
//       }

//       await client.query(
//         `INSERT INTO products (title, price, url, delivery_city, scraped_at)
//          VALUES ($1, $2, $3, $4, NOW())`,
//         [product.title, product.price, product.url, product.delivery_city]
//       );
//       savedCount++;
//       console.log(`Saved product ${index + 1}/${products.length}`);
//     }

//     console.log(`Successfully saved ${savedCount} valid products to database`);
//     await client.end();
//   } catch (error) {
//     console.error("Scraping failed:", error);
//     await page.screenshot({ path: "error.png" });
//   } finally {
//     await browser.close();
//     console.log("Browser closed");
//   }
// }

// runScrape();