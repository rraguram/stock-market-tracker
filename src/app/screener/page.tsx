"use client";

import { useState } from "react";
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
import { Search, TrendingUp, TrendingDown } from "lucide-react";

export default function ScreenerPage() {
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    minVolume: "",
    sector: "all",
    priceChange: "all",
  });

  const sampleStocks = [
    { symbol: "AAPL", name: "Apple Inc.", price: 178.45, change: 2.34, volume: "52.4M", sector: "Technology" },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 378.91, change: -1.23, volume: "28.1M", sector: "Technology" },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.65, change: 3.45, volume: "31.2M", sector: "Technology" },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 178.35, change: 1.87, volume: "45.6M", sector: "Consumer" },
    { symbol: "TSLA", name: "Tesla Inc.", price: 242.84, change: -2.45, volume: "98.3M", sector: "Automotive" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Purple Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-500/15 rounded-full blur-[100px] -translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-fuchsia-500/10 rounded-full blur-[110px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Navigation />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Stock Screener</h1>
          <p className="text-muted-foreground">
            Filter and discover stocks based on your criteria
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-card/95 backdrop-blur-sm border-border/50">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="minVolume">Min Volume</Label>
              <Input
                id="minVolume"
                type="text"
                placeholder="1M"
                value={filters.minVolume}
                onChange={(e) => setFilters({ ...filters, minVolume: e.target.value })}
              />
            </div>

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
                  <SelectItem value="automotive">Automotive</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div className="flex items-end">
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card className="overflow-hidden bg-card/95 backdrop-blur-sm border-border/50">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Results ({sampleStocks.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-semibold">Symbol</th>
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-right p-4 font-semibold">Price</th>
                  <th className="text-right p-4 font-semibold">Change</th>
                  <th className="text-right p-4 font-semibold">Volume</th>
                  <th className="text-left p-4 font-semibold">Sector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {sampleStocks.map((stock) => {
                  const isPositive = stock.change >= 0;
                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="font-bold text-cyan-400">{stock.symbol}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{stock.name}</div>
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
                            {stock.change.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right text-muted-foreground">
                        {stock.volume}
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
        </Card>
      </main>
    </div>
  );
}
