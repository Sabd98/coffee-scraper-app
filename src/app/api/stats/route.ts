import { NextResponse } from "next/server";
import { sequelize } from "@/lib/sequelize/connection";
import { QueryTypes } from "sequelize";
import { axiosErrorHandler } from "@/lib/axiosErrorHandler";

export async function GET() {
  try {
    // Verifikasi koneksi database
    await sequelize.authenticate();

    // Gunakan raw query untuk menghindari masalah ORM
    const stats = await sequelize.query(
      `
      SELECT 
        delivery_city AS city, 
        AVG(price)::numeric(10,2) AS "avgPrice",
        COUNT(id) AS "productCount"
      FROM products
      GROUP BY delivery_city
      ORDER BY "avgPrice" DESC
    `,
      {
        type: QueryTypes.SELECT,
      }
    );

    return NextResponse.json(stats);
  } catch (error) {
    const errorMessage = axiosErrorHandler(error);
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
