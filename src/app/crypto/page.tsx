"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Crypto } from "@/lib/crypto";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function CryptoPage() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCryptos() {
      try {
        setLoading(true);
        const response = await fetch("/api/crypto");
        if (!response.ok) throw new Error("Failed to fetch crypto data");
        const data = await response.json();
        setCryptos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchCryptos();
    const interval = setInterval(fetchCryptos, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Prepare data for performance chart (top 10 by day performance)
  const chartData = cryptos
    .slice(0, 10)
    .map((crypto) => ({
      name: crypto.ticker,
      performance: crypto.perfDay,
    }));

  return (
    <div className="min-h-screen bg-background relative">
      {/* Purple Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-fuchsia-500/10 rounded-full blur-[110px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Navigation />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Cryptocurrency Market</h1>
          <p className="text-muted-foreground">
            Track major crypto assets with real-time performance metrics
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Performance Chart */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Daily Performance</h2>
          {loading ? (
            <Skeleton className="h-[400px]" />
          ) : (
            <Card className="p-6 bg-card/95 backdrop-blur-sm border-border/50">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, "Performance"]}
                  />
                  <Bar dataKey="performance" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.performance >= 0 ? "#22c55e" : "#ef4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </section>

        {/* Detailed Table */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
          {loading ? (
            <Skeleton className="h-[600px]" />
          ) : (
            <Card className="overflow-hidden bg-card/95 backdrop-blur-sm border-border/50">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-semibold">Asset</th>
                      <th className="text-right p-4 font-semibold">Price</th>
                      <th className="text-right p-4 font-semibold">5Min</th>
                      <th className="text-right p-4 font-semibold">Hour</th>
                      <th className="text-right p-4 font-semibold">Day</th>
                      <th className="text-right p-4 font-semibold">Week</th>
                      <th className="text-right p-4 font-semibold">Month</th>
                      <th className="text-right p-4 font-semibold">Quarter</th>
                      <th className="text-right p-4 font-semibold">Half</th>
                      <th className="text-right p-4 font-semibold">YTD</th>
                      <th className="text-right p-4 font-semibold">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {cryptos.map((crypto) => {
                      const isPriceHigh = crypto.price >= 1000;
                      return (
                        <tr
                          key={crypto.ticker}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4">
                            <div>
                              <div className="font-bold">{crypto.ticker}</div>
                              <div className="text-sm text-muted-foreground">
                                {crypto.name}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium">
                            ${isPriceHigh ? crypto.price.toLocaleString() : crypto.price.toFixed(4)}
                          </td>
                          <PerformanceCell value={crypto.perf5Min} />
                          <PerformanceCell value={crypto.perfHour} />
                          <PerformanceCell value={crypto.perfDay} />
                          <PerformanceCell value={crypto.perfWeek} />
                          <PerformanceCell value={crypto.perfMonth} />
                          <PerformanceCell value={crypto.perfQuart} />
                          <PerformanceCell value={crypto.perfHalf} />
                          <PerformanceCell value={crypto.perfYTD} />
                          <PerformanceCell value={crypto.perfYear} />
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}

function PerformanceCell({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <td className="p-4 text-right">
      <div
        className={`flex items-center justify-end gap-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <ArrowUpIcon className="h-3 w-3" />
        ) : (
          <ArrowDownIcon className="h-3 w-3" />
        )}
        <span className="font-medium">{Math.abs(value).toFixed(2)}%</span>
      </div>
    </td>
  );
}
