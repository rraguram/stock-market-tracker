"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Stock, MarketIndex, NewsItem } from "@/lib/stocks";
import { StockCard } from "@/components/StockCard";
import { StockListItem } from "@/components/StockListItem";
import { StockCompactItem } from "@/components/StockCompactItem";
import { CryptoCard } from "@/components/CryptoCard";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import Link from "next/link";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp } from "lucide-react";
import { StockHeatmap } from "@/components/StockHeatmap";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface Crypto {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  high: number;
  low: number;
}

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=" + encodeURIComponent("/"));
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      async function fetchData() {
        try {
          setLoading(true);
          const [indicesRes, stocksRes, cryptosRes, newsRes] = await Promise.all([
            fetch("/api/indices"),
            fetch("/api/stocks"),
            fetch("/api/crypto"),
            fetch("/api/news"),
          ]);

          const [indicesData, stocksData, cryptosData, newsData] = await Promise.all([
            indicesRes.json(),
            stocksRes.json(),
            cryptosRes.json(),
            newsRes.json(),
          ]);

          // Handle error responses properly
          if (indicesData && !indicesData.error && Array.isArray(indicesData)) {
            setIndices(indicesData);
          } else {
            console.error("Indices error:", indicesData?.error);
            setIndices([]);
          }

          if (stocksData && !stocksData.error && Array.isArray(stocksData)) {
            setStocks(stocksData);
          } else {
            console.error("Stocks error:", stocksData?.error);
            toast.error(stocksData?.error || "Failed to load stock data");
            setStocks([]);
          }

          if (cryptosData && !cryptosData.error && Array.isArray(cryptosData)) {
            setCryptos(cryptosData.slice(0, 5));
          } else {
            console.error("Cryptos error:", cryptosData?.error);
            setCryptos([]);
          }

          if (newsData && !newsData.error && Array.isArray(newsData)) {
            setNews(newsData.slice(0, 3));
          } else {
            console.error("News error:", newsData?.error);
            setNews([]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to fetch market data");
        } finally {
          setLoading(false);
        }
      }

      fetchData();
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Purple Texture Overlay */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-fuchsia-500/10 rounded-full blur-[110px] -translate-x-1/2 -translate-y-1/2" />
        </div>

        <Navigation />
        <main className="container mx-auto px-4 py-8 relative z-10 pb-24 pt-20">
          <div className="mb-8">
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-[240px]" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Purple Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-fuchsia-500/10 rounded-full blur-[110px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Navigation />
      
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background relative pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              Track Your Financial Future
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8">
              Real-time stock tracking, portfolio management, and market insights all in one place
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/portfolio" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  Manage Portfolio
                </Button>
              </Link>
              <Link href="/news" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  View All News
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 md:py-12 relative z-10 pb-24">
        {/* Market Heatmap */}
        <section className="mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Market Heatmap</h2>
          {loading ? (
            <Skeleton className="h-[600px]" />
          ) : stocks.length > 0 ? (
            <StockHeatmap stocks={stocks} />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No stock data available</p>
            </Card>
          )}
        </section>

        {/* Market Indices */}
        <section className="mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Market Overview</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {indices.map((index) => {
                const isPositive = index.change >= 0;
                return (
                  <Card key={index.symbol} className="p-4 md:p-6 relative overflow-hidden backdrop-blur-sm bg-card/80">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {index.name}
                          </p>
                          <p className="text-2xl md:text-3xl font-bold mt-1">
                            {index.value.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 text-sm font-medium ${
                            isPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpIcon className="h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                          )}
                          {Math.abs(index.changePercent).toFixed(2)}%
                        </div>
                      </div>
                      <div
                        className={`text-base md:text-lg font-medium ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isPositive ? "+" : ""}
                        {index.change.toFixed(2)}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Top Market Leaders by Market Cap */}
        <section className="mb-10 md:mb-12">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Top Market Leaders</h2>
              <p className="text-muted-foreground">
                Real-time tracking of the largest S&P 500 companies by market capitalization
              </p>
            </div>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-[240px]" />
              ))}
            </div>
          ) : stocks.length > 0 ? (
            <>
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stocks.map((stock) => (
                    <StockCard key={stock.symbol} stock={stock} />
                  ))}
                </div>
              )}
              {viewMode === "list" && (
                <div className="space-y-3">
                  {stocks.map((stock) => (
                    <StockListItem key={stock.symbol} stock={stock} />
                  ))}
                </div>
              )}
              {viewMode === "compact" && (
                <div className="space-y-2">
                  {stocks.map((stock) => (
                    <StockCompactItem key={stock.symbol} stock={stock} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Unable to load stock data. Please check your Alpha Vantage API key.</p>
            </Card>
          )}
        </section>

        {/* Top 5 Cryptocurrencies */}
        <section className="mb-10 md:mb-12">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Top Cryptocurrencies</h2>
              <p className="text-muted-foreground">
                Real-time tracking of the largest cryptocurrencies by market cap
              </p>
            </div>
            <Link href="/crypto">
              <Button variant="outline" size="sm" className="md:size-default">
                View All Crypto
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-[280px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {cryptos.map((crypto) => (
                <CryptoCard key={crypto.ticker} crypto={crypto} />
              ))}
            </div>
          )}
        </section>

        {/* Latest News */}
        <section>
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Financial News</h2>
            <Link href="/news">
              <Button variant="outline" size="sm" className="md:size-default">View All News</Button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[350px]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="mt-12 md:mt-16 mb-6 md:mb-8">
          <Card className="p-6 md:p-12 text-center bg-gradient-to-br from-purple-500/20 via-primary/10 to-violet-500/20 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
                Start Building Your Portfolio Today
              </h2>
              <p className="text-sm md:text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
                Track your favorite stocks, manage your investments, and stay updated with real-time market data and news.
              </p>
              <Link href="/portfolio">
                <Button size="lg" className="gap-2">
                  Create Portfolio
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}