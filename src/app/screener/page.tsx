"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import Link from "next/link";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  peRatio: number;
  eps: number;
  beta: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sector: string;
}

export default function ScreenerPage() {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minVolume: "",
    maxVolume: "",
    minMarketCap: "",
    maxMarketCap: "",
    minPE: "",
    maxPE: "",
    minEPS: "",
    maxEPS: "",
    minDividendYield: "",
    maxDividendYield: "",
    minBeta: "",
    maxBeta: "",
    sector: "all",
    priceChange: "all",
  });

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyFilters = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          params.append(key, value);
        }
      });

      const response = await fetch(`/api/screener?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch screener data");
      }

      const data = await response.json();
      setStocks(data.results || []);
    } catch (err) {
      setError("Failed to load screener results. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    applyFilters();
  }, []);

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
  };

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
          <h1 className="text-4xl font-bold mb-2">Stock Screener</h1>
          <p className="text-muted-foreground">
            Filter and discover stocks from Yahoo Finance based on comprehensive criteria
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-card/95 backdrop-blur-sm border-border/50">
          <h2 className="text-xl font-bold mb-4">Advanced Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Price Filters */}
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price ($)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              />
            </div>

            {/* Volume Filters */}
            <div className="space-y-2">
              <Label htmlFor="minVolume">Min Volume</Label>
              <Input
                id="minVolume"
                type="number"
                placeholder="1000000"
                value={filters.minVolume}
                onChange={(e) => setFilters({ ...filters, minVolume: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxVolume">Max Volume</Label>
              <Input
                id="maxVolume"
                type="number"
                placeholder="100000000"
                value={filters.maxVolume}
                onChange={(e) => setFilters({ ...filters, maxVolume: e.target.value })}
              />
            </div>

            {/* Market Cap Filters */}
            <div className="space-y-2">
              <Label htmlFor="minMarketCap">Min Market Cap ($)</Label>
              <Input
                id="minMarketCap"
                type="number"
                placeholder="1000000000"
                value={filters.minMarketCap}
                onChange={(e) => setFilters({ ...filters, minMarketCap: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMarketCap">Max Market Cap ($)</Label>
              <Input
                id="maxMarketCap"
                type="number"
                placeholder="1000000000000"
                value={filters.maxMarketCap}
                onChange={(e) => setFilters({ ...filters, maxMarketCap: e.target.value })}
              />
            </div>

            {/* P/E Ratio Filters */}
            <div className="space-y-2">
              <Label htmlFor="minPE">Min P/E Ratio</Label>
              <Input
                id="minPE"
                type="number"
                placeholder="0"
                value={filters.minPE}
                onChange={(e) => setFilters({ ...filters, minPE: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPE">Max P/E Ratio</Label>
              <Input
                id="maxPE"
                type="number"
                placeholder="50"
                value={filters.maxPE}
                onChange={(e) => setFilters({ ...filters, maxPE: e.target.value })}
              />
            </div>

            {/* EPS Filters */}
            <div className="space-y-2">
              <Label htmlFor="minEPS">Min EPS ($)</Label>
              <Input
                id="minEPS"
                type="number"
                placeholder="0"
                value={filters.minEPS}
                onChange={(e) => setFilters({ ...filters, minEPS: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxEPS">Max EPS ($)</Label>
              <Input
                id="maxEPS"
                type="number"
                placeholder="100"
                value={filters.maxEPS}
                onChange={(e) => setFilters({ ...filters, maxEPS: e.target.value })}
              />
            </div>

            {/* Dividend Yield Filters */}
            <div className="space-y-2">
              <Label htmlFor="minDividendYield">Min Dividend Yield (%)</Label>
              <Input
                id="minDividendYield"
                type="number"
                placeholder="0"
                value={filters.minDividendYield}
                onChange={(e) => setFilters({ ...filters, minDividendYield: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDividendYield">Max Dividend Yield (%)</Label>
              <Input
                id="maxDividendYield"
                type="number"
                placeholder="10"
                value={filters.maxDividendYield}
                onChange={(e) => setFilters({ ...filters, maxDividendYield: e.target.value })}
              />
            </div>

            {/* Beta Filters */}
            <div className="space-y-2">
              <Label htmlFor="minBeta">Min Beta</Label>
              <Input
                id="minBeta"
                type="number"
                step="0.1"
                placeholder="0"
                value={filters.minBeta}
                onChange={(e) => setFilters({ ...filters, minBeta: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBeta">Max Beta</Label>
              <Input
                id="maxBeta"
                type="number"
                step="0.1"
                placeholder="2"
                value={filters.maxBeta}
                onChange={(e) => setFilters({ ...filters, maxBeta: e.target.value })}
              />
            </div>

            {/* Sector Filter */}
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select value={filters.sector} onValueChange={(value) => setFilters({ ...filters, sector: value })}>
                <SelectTrigger id="sector">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="energy">Energy</SelectItem>
                  <SelectItem value="industrials">Industrials</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Change Filter */}
            <div className="space-y-2">
              <Label htmlFor="priceChange">Price Change</Label>
              <Select value={filters.priceChange} onValueChange={(value) => setFilters({ ...filters, priceChange: value })}>
                <SelectTrigger id="priceChange">
                  <SelectValue placeholder="Select change" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="gainers">Gainers Only</SelectItem>
                  <SelectItem value="losers">Losers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end md:col-span-3 lg:col-span-4">
              <Button 
                className="w-full md:w-auto" 
                onClick={applyFilters}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Screening...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-4 mb-6 bg-destructive/10 border-destructive/50">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {/* Results */}
        <Card className="overflow-hidden bg-card/95 backdrop-blur-sm border-border/50">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">
              Results ({loading ? "..." : stocks.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading stocks from Yahoo Finance...</span>
            </div>
          ) : stocks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No stocks match your criteria. Try adjusting your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Symbol</th>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-right p-4 font-semibold">Price</th>
                    <th className="text-right p-4 font-semibold">Change</th>
                    <th className="text-right p-4 font-semibold">Volume</th>
                    <th className="text-right p-4 font-semibold">Market Cap</th>
                    <th className="text-right p-4 font-semibold">P/E</th>
                    <th className="text-right p-4 font-semibold">EPS</th>
                    <th className="text-right p-4 font-semibold">Dividend</th>
                    <th className="text-right p-4 font-semibold">Beta</th>
                    <th className="text-left p-4 font-semibold">Sector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stocks.map((stock) => {
                    const isPositive = stock.changePercent >= 0;
                    return (
                      <tr
                        key={stock.symbol}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4">
                          <Link href={`/stocks/${stock.symbol}`}>
                            <div className="font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer">
                              {stock.symbol}
                            </div>
                          </Link>
                        </td>
                        <td className="p-4">
                          <div className="text-sm max-w-[200px] truncate">{stock.name}</div>
                        </td>
                        <td className="p-4 text-right font-medium">
                          ${stock.price.toFixed(2)}
                        </td>
                        <td className="p-4 text-right">
                          <div
                            className={`flex items-center justify-end gap-1 ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {isPositive ? "+" : ""}
                              {stock.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right text-muted-foreground">
                          {formatVolume(stock.volume)}
                        </td>
                        <td className="p-4 text-right font-medium">
                          ${stock.marketCap}
                        </td>
                        <td className="p-4 text-right">
                          {stock.peRatio > 0 ? stock.peRatio.toFixed(2) : "N/A"}
                        </td>
                        <td className="p-4 text-right">
                          ${stock.eps > 0 ? stock.eps.toFixed(2) : "N/A"}
                        </td>
                        <td className="p-4 text-right">
                          {stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(2)}%` : "—"}
                        </td>
                        <td className="p-4 text-right">
                          {stock.beta.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <span className="text-sm px-2 py-1 bg-muted rounded-md">
                            {stock.sector}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}