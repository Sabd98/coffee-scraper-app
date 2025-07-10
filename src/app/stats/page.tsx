"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import CityStatsChart from "@/components/cityStatsChart";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

interface CityStat {
  city: string;
  avgPrice: number;
  productCount: number;
}

export default function StatsPage() {
  //states data stat
  const [stats, setStats] = useState<CityStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //fungsi mengambil data stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/stats");

      // Pastikan response valid
      if (response.data && Array.isArray(response.data)) {
        setStats(response.data);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      setError(`Gagal memuat data Dashboard: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setStats]);

  //jalankan fungsinya
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Tampilkan error jika ada
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold">Error</h2>
          <p>{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Hitung Dashboard keseluruhan
  const totalProducts = stats.reduce(
    (sum, stat) => sum + Number(stat.productCount),
    0
  );
  
  const overallAvg =
    stats.length > 0
      ? stats.reduce(
          (sum, stat) =>
            sum + Number(stat.avgPrice) * Number(stat.productCount),
          0
        ) / totalProducts
      : 0;

  return (
    <section className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Distribution Products Dashboard</h1>
        <Button
          onClick={fetchStats}
          disabled={loading}
          variant="outline"
          className="hover:shadow-md border border-amber-950 "
        >
          {loading ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Data
        </Button>
      </div>

      {error && (
        <article className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">
          {error}
        </article>
      )}

      <article className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-amber-950 shadow-md">
          <CardHeader>
            <CardTitle>Total Cities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.length}</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-950 shadow-md">
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-950 shadow-md">
          <CardHeader>
            <CardTitle>Price Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              Rp {Math.round(overallAvg).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </article>

      {loading ? (
        <article className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </article>
      ) : stats.length > 0 ? (
        <>
          <Card className="mb-8 border border-amber-950 shadow-md">
            <CardHeader>
              <CardTitle>Price Distribution per City</CardTitle>
            </CardHeader>
            <CardContent>
              <CityStatsChart data={stats} />
            </CardContent>
          </Card>

          <Card className="border border-amber-950 shadow-md">
            <CardHeader>
              <CardTitle>Statistic Detail per City</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City</TableHead>
                    <TableHead className="text-center">Price Average</TableHead>
                    <TableHead className="text-center">
                      Product Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((stat) => (
                    <TableRow key={stat.city}>
                      <TableCell>{stat.city}</TableCell>
                      <TableCell className="text-center">
                        Rp {Math.round(stat.avgPrice).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        {stat.productCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <article className="text-center py-12">
          <p>No statistic data on dashboard. Please scrape it first.</p>
          <Button className="mt-4" asChild>
            <a href="/scrape">To Scraping Page</a>
          </Button>
        </article>
      )}
    </section>
  );
}
