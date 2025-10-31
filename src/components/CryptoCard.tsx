"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoCardProps {
  crypto: {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: string;
    high: number;
    low: number;
  };
}

export function CryptoCard({ crypto }: CryptoCardProps) {
  const isPositive = crypto.change >= 0;

  return (
    <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] duration-200 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 opacity-5 ${
        isPositive ? 'bg-gradient-to-br from-green-500' : 'bg-gradient-to-br from-red-500'
      }`} />
      
      <div className="space-y-4 relative">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">{crypto.ticker}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {crypto.name}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md ${
              isPositive 
                ? "text-green-600 bg-green-100/50 dark:bg-green-900/20" 
                : "text-red-600 bg-red-100/50 dark:bg-red-900/20"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {Math.abs(crypto.changePercent).toFixed(2)}%
          </div>
        </div>

        <div>
          <div className="text-3xl font-bold">
            ${crypto.price >= 1 ? crypto.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }) : crypto.price.toFixed(4)}
          </div>
          <div
            className={`text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            ${Math.abs(crypto.change).toFixed(2)} today
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t">
          <div>
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="font-semibold text-sm">{crypto.marketCap}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="font-semibold text-sm">
              {(crypto.volume / 1000000).toFixed(1)}M
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">24h High</p>
            <p className="font-semibold text-sm text-green-600">
              ${crypto.high.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">24h Low</p>
            <p className="font-semibold text-sm text-red-600">
              ${crypto.low.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
