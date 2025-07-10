"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Product } from "@/lib/sequelize/initModels";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Pagination } from "@/components/ui/pagination";

export default function ProductsPage() {
  //state data produk dsb
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  // Fungsi untuk mengambil data produk
  const fetchProducts = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/products?page=${page}&perPage=${perPage}`
      );
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  //Inisiasi fungsi mengambil data produk
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, fetchProducts]);

  return (
    <section className="container mx-auto p-4">
      <nav className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Scraped Products</h1>
        <div className="flex space-x-2">
          <Button
            asChild
            className="hover:shadow-md border border-amber-950 "
            variant="outline"
          >
            <Link href="/scrape" className="flex gap-x-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Scrape Again
            </Link>
          </Button>
        </div>
      </nav>

      {/* Elemen tabel jika loading atau setelah loading */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading Products...</p>
        </div>
      ) : (
        <>
          <Table className="border border-amber-950 shadow-md">
            <TableHeader>
              <TableRow className=" border border-amber-950">
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id} className=" border border-amber-950">
                  <TableCell className="max-w-xs truncate">
                    {product.title}
                  </TableCell>
                  <TableCell>Rp {product.price.toLocaleString()}</TableCell>
                  <TableCell>{product.deliveryCity}</TableCell>
                  <TableCell>
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className=" border border-amber-950"
                    >
                      <Link href={product.url} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </section>
  );
}
