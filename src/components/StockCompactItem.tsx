"use client";

import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import Link from "next/link";
import { Stock } from "@/lib/stocks";

interface StockCompactItemProps {
  stock: Stock;
}

export function StockCompactItem({ stock }: StockCompactItemProps) {
  const isPositive = stock.change >= 0;

  return (
    <Link href={`/stocks/${stock.symbol}`}>
      <div className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="font-bold text-sm min-w-[60px]">{stock.symbol}</div>
            
            <div className="text-right">
              <div className="text-base font-bold">${stock.price.toFixed(2)}</div>
            </div>
          </div>

          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : (
              <ArrowDownIcon className="h-3 w-3" />
            )}
            {Math.abs(stock.changePercent).toFixed(2)}%
          </div>
        </div>
      </div>
    </Link>
  );
}
