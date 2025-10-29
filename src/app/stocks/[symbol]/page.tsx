"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Stock, StockHistory, NewsItem } from "@/lib/stocks";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Link from "next/link";

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y";

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  const [stock, setStock] = useState<Stock | null>(null);
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [range, setRange] = useState<TimeRange>("1M");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [stockRes, historyRes, newsRes] = await Promise.all([
          fetch(`/api/stocks/${symbol}`),
          fetch(`/api/stocks/${symbol}/history?range=${range}`),
          fetch(`/api/news?symbol=${symbol}`),
        ]);

        const [stockData, historyData, newsData] = await Promise.all([
          stockRes.json(),
          historyRes.json(),
          newsRes.json(),
        ]);

        setStock(stockData);
        setHistory(historyData);
        setNews(newsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol, range]);

  if (loading || !stock) {
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
          <Skeleton className="h-32 mb-8" />
          <Skeleton className="h-96 mb-8" />
          <Skeleton className="h-64" />
        </main>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const isHighAboveOpen = stock.high > stock.open;
  const isLowBelowOpen = stock.low < stock.open;
  
  // Calculate 52-week range position with safety checks
  const hasExtendedMetrics = stock.fiftyTwoWeekHigh !== undefined && stock.fiftyTwoWeekLow !== undefined;
  const fiftyTwoWeekRange = hasExtendedMetrics ? stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow : 0;
  const pricePositionInRange = hasExtendedMetrics ? ((stock.price - stock.fiftyTwoWeekLow) / fiftyTwoWeekRange) * 100 : 0;
  const isNearHigh = pricePositionInRange > 80;
  const isNearLow = pricePositionInRange < 20;

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
        <Card 
          className={`p-6 mb-8 border-2 transition-colors ${
            isPositive 
              ? "border-green-500/20 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20" 
              : "border-red-500/20 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-950/20"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{stock.symbol}</h1>
              <p className="text-muted-foreground text-lg">{stock.name}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">
                ${stock.price.toFixed(2)}
              </div>
              <div
                className={`flex items-center justify-end gap-2 text-lg font-medium px-3 py-1 rounded-lg ${
                  isPositive 
                    ? "text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20" 
                    : "text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20"
                }`}
              >
                {isPositive ? (
                  <ArrowUpIcon className="h-5 w-5" />
                ) : (
                  <ArrowDownIcon className="h-5 w-5" />
                )}
                {isPositive ? "+" : ""}
                {stock.change.toFixed(2)} ({Math.abs(stock.changePercent).toFixed(2)}%)
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="font-semibold">${stock.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High</p>
              <p className={`font-semibold ${isHighAboveOpen ? "text-green-600 dark:text-green-400" : ""}`}>
                ${stock.high.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low</p>
              <p className={`font-semibold ${isLowBelowOpen ? "text-red-600 dark:text-red-400" : ""}`}>
                ${stock.low.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prev Close</p>
              <p className="font-semibold">${stock.previousClose.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Volume</p>
              <p className="font-semibold">
                {(stock.volume / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="font-semibold">{stock.marketCap}</p>
            </div>
          </div>
        </Card>

        {/* Additional Stock Metrics */}
        {hasExtendedMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Key Statistics */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Key Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-muted-foreground">P/E Ratio</span>
                  <span className="font-semibold">{stock.peRatio?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-muted-foreground">EPS (TTM)</span>
                  <span className="font-semibold">${stock.eps?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-muted-foreground">Beta</span>
                  <span className={`font-semibold ${stock.beta && stock.beta > 1 ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {stock.beta?.toFixed(2) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-muted-foreground">Dividend Yield</span>
                  <span className="font-semibold">{stock.dividendYield?.toFixed(2) || '0.00'}%</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-sm text-muted-foreground">Avg Volume</span>
                  <span className="font-semibold">{stock.avgVolume ? (stock.avgVolume / 1000000).toFixed(1) + 'M' : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Shares Outstanding</span>
                  <span className="font-semibold">{stock.sharesOutstanding || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {/* 52-Week Range */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">52-Week Range</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Low: ${stock.fiftyTwoWeekLow.toFixed(2)}
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      High: ${stock.fiftyTwoWeekHigh.toFixed(2)}
                    </span>
                  </div>
                  {/* Range Bar */}
                  <div className="relative h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 dark:from-red-900/40 dark:via-yellow-900/40 dark:to-green-900/40 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 h-full w-1 bg-foreground shadow-lg"
                      style={{ left: `${pricePositionInRange}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${
                          isNearHigh 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                            : isNearLow
                            ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
                            : "bg-muted text-foreground"
                        }`}>
                          ${stock.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Position in Range</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">{pricePositionInRange.toFixed(1)}%</div>
                    {isNearHigh && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 font-medium">
                        Near High
                      </span>
                    )}
                    {isNearLow && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400 font-medium">
                        Near Low
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">From Low</p>
                    <p className={`font-semibold ${stock.price > stock.fiftyTwoWeekLow ? "text-green-600 dark:text-green-400" : ""}`}>
                      +{(((stock.price - stock.fiftyTwoWeekLow) / stock.fiftyTwoWeekLow) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">From High</p>
                    <p className={`font-semibold ${stock.price < stock.fiftyTwoWeekHigh ? "text-red-600 dark:text-red-400" : ""}`}>
                      {(((stock.price - stock.fiftyTwoWeekHigh) / stock.fiftyTwoWeekHigh) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Historical Data</h2>
            <div className="flex gap-2">
              {(["1D", "1W", "1M", "3M", "1Y"] as TimeRange[]).map((r) => (
                <Button
                  key={r}
                  variant={range === r ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRange(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(date) => {
                  const d = new Date(date);
                  if (range === "1D") {
                    return d.toLocaleTimeString();
                  }
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const month = months[d.getMonth()];
                  const year = d.getFullYear().toString().slice(-2);
                  return `${month}'${year}`;
                }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke={isPositive ? "#16a34a" : "#dc2626"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Related News</h2>
            <Link href={`/news?symbol=${symbol}`}>
              <Button variant="outline" size="sm">
                View More News
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {news.slice(0, 10).map((item) => (
              <Card
                key={item.id}
                className="p-4 hover:bg-accent/50 transition-colors"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex gap-4">
                    {item.image && (
                      <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{item.source}</span>
                        <span>•</span>
                        <time dateTime={item.publishedAt}>
                          {new Date(item.publishedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </time>
                      </div>
                    </div>
                  </div>
                </a>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}