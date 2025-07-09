import { NextResponse } from "next/server";
import { Product } from "@/lib/sequelize/initModels";
import {sequelize} from "@/lib/sequelize/connection";

//API untuk ambil data produk dari database postgre
export async function GET(request: Request) {
  await sequelize.sync();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");

  const offset = (page - 1) * perPage;

  try {
    const { count, rows: products } = await Product.findAndCountAll({
      order: [["scrapedAt", "DESC"]],
      limit: perPage,
      offset: offset,
    });

    const totalPages = Math.ceil(count / perPage);

    return NextResponse.json({
      products,
      totalPages,
      currentPage: page,
      totalItems: count,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
