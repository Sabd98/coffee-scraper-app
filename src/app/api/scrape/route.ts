
import { NextResponse } from "next/server";
import {Product} from "@/lib/sequelize/models/Product.model";
import {sequelize} from "@/lib/sequelize/connection";
import { syncModels } from "@/lib/sequelize/initModels";
import { axiosErrorHandler } from "@/lib/axiosErrorHandler";

export const dynamic = "force-dynamic"; // Pastikan tidak di-cache

export async function GET() {
  try {
    // Scrape data dari Tokopedia
    const {scrapeTokopedia}= await import('@/services/scraper.service');
    const scrapedProducts = await scrapeTokopedia();

    if (scrapedProducts.length === 0) {
      return NextResponse.json(
        { success: false, message: "No products scraped" },
        { status: 404 }
      );
    }

    // Simpan ke database
    await syncModels();

    const transaction = await sequelize.transaction();
    try {
      // Hapus data lama
      await Product.destroy({ where: {}, transaction });

      // Simpan data baru
      for (const product of scrapedProducts) {
        await Product.create(
          {
            title: product.title,
            price: product.price,
            url: product.url,
            deliveryCity: product.delivery_city,
          },
          { transaction }
        );
      }

      await transaction.commit();
    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      count: scrapedProducts.length,
      data: scrapedProducts,
    });
  } catch (error) {
    const errorMessage = axiosErrorHandler(error);
    return NextResponse.json(
      { success: false, error: errorMessage || "Scraping failed" },
      { status: 500 }
    );
  }
}

