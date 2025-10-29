"use client";

import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Link from "next/link";
import { Stock } from "@/lib/stocks";

interface StockListItemProps {
  stock: Stock;
}

export function StockListItem({ stock }: StockListItemProps) {
  const isPositive = stock.change >= 0;

  return (
    <Link href={`/stocks/${stock.symbol}`}>
      <div className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="min-w-[80px]">
              <h3 className="font-bold text-base">{stock.symbol}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {stock.name}
              </p>
            </div>

            <div className="text-right min-w-[100px]">
              <div className="text-xl font-bold">${stock.price.toFixed(2)}</div>
              <div
                className={`text-xs ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {stock.change.toFixed(2)}
              </div>
            </div>

            <div
              className={`flex items-center gap-1 text-sm font-medium min-w-[80px] ${
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

          <div className="hidden sm:flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Volume</p>
              <p className="font-medium">
                {(stock.volume / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="text-right min-w-[100px]">
              <p className="text-muted-foreground text-xs">Market Cap</p>
              <p className="font-medium">{stock.marketCap}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
