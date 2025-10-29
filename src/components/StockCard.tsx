"use client";

import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Link from "next/link";
import { Stock } from "@/lib/stocks";

interface StockCardProps {
  stock: Stock;
}

export function StockCard({ stock }: StockCardProps) {
  const isPositive = stock.change >= 0;

  return (
    <Link href={`/stocks/${stock.symbol}`}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{stock.symbol}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {stock.name}
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
              {Math.abs(stock.changePercent).toFixed(2)}%
            </div>
          </div>

          <div>
            <div className="text-3xl font-bold">${stock.price.toFixed(2)}</div>
            <div
              className={`text-sm ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? "+" : ""}
              {stock.change.toFixed(2)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Volume</p>
              <p className="font-medium">
                {(stock.volume / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium">{stock.marketCap}</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
