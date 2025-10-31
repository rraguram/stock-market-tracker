"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Stock } from "@/lib/stocks";

interface StockCardProps {
  stock: Stock;
}

export function StockCard({ stock }: StockCardProps) {
  const isPositive = stock.change >= 0;
  const peRatio = stock.peRatio || 0;
  const dividendYield = stock.dividendYield || 0;

  return (
    <Link href={`/stocks/${stock.symbol}`}>
      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] duration-200 relative overflow-hidden">
        {/* Gradient overlay based on performance */}
        <div className={`absolute inset-0 opacity-5 ${
          isPositive ? 'bg-gradient-to-br from-green-500' : 'bg-gradient-to-br from-red-500'
        }`} />
        
        <div className="space-y-4 relative">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg">{stock.symbol}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {stock.name}
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
              {Math.abs(stock.changePercent).toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-3xl font-bold">${stock.price.toFixed(2)}</div>
            <div
              className={`text-sm font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)} today
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="font-semibold text-sm">{stock.marketCap}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Volume</p>
              <p className="font-semibold text-sm">
                {(stock.volume / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">P/E Ratio</p>
              <p className="font-semibold text-sm">
                {peRatio > 0 ? peRatio.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Div Yield</p>
              <p className="font-semibold text-sm">
                {dividendYield > 0 ? `${dividendYield.toFixed(2)}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* 52-week indicator */}
          <div className="pt-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
              <span>52W Low</span>
              <span>52W High</span>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`absolute left-0 top-0 h-full rounded-full ${
                  isPositive ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, 
                    ((stock.price - stock.fiftyTwoWeekLow) / 
                    (stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow)) * 100
                  ))}%`
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}