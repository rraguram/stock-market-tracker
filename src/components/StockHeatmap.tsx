"use client";

import { Card } from "@/components/ui/card";
import { Stock } from "@/lib/stocks";

interface StockWithSector extends Stock {
  sector: string;
  marketCap: number;
}

interface StockHeatmapProps {
  stocks: Stock[];
}

export function StockHeatmap({ stocks }: StockHeatmapProps) {
  // Map stocks to sectors with market cap estimates
  const stocksWithSectors: StockWithSector[] = stocks.map((stock) => {
    let sector = "TECHNOLOGY";
    let marketCap = stock.volume * stock.price; // Rough estimate
    
    // Categorize by symbol (simplified categorization)
    if (["AAPL", "MSFT", "NVDA", "GOOGL", "META", "INTC", "AMD", "AVGO"].includes(stock.symbol)) {
      sector = "TECHNOLOGY";
    } else if (["AMZN", "TSLA", "HD", "NKE", "MCD", "SBUX", "TJX"].includes(stock.symbol)) {
      sector = "CONSUMER";
    } else if (["JPM", "V", "MA", "BAC", "WFC", "GS", "MS", "C"].includes(stock.symbol)) {
      sector = "FINANCIAL";
    } else if (["JNJ", "UNH", "LLY", "ABBV", "PFE", "TMO", "DHR", "ABT"].includes(stock.symbol)) {
      sector = "HEALTHCARE";
    } else if (["XOM", "CVX", "COP", "PSX", "VLO"].includes(stock.symbol)) {
      sector = "ENERGY";
    } else if (["BA", "GE", "CAT", "HON", "UPS", "RTX", "LMT"].includes(stock.symbol)) {
      sector = "INDUSTRIALS";
    } else if (["NFLX", "DIS", "CMCSA", "VZ", "T", "TMUS"].includes(stock.symbol)) {
      sector = "COMMUNICATION";
    } else if (["PG", "KO", "PEP", "WMT", "COST", "PM"].includes(stock.symbol)) {
      sector = "CONSUMER STAPLES";
    }
    
    return { ...stock, sector, marketCap };
  });

  // Group stocks by sector
  const sectors = stocksWithSectors.reduce((acc, stock) => {
    if (!acc[stock.sector]) {
      acc[stock.sector] = [];
    }
    acc[stock.sector].push(stock);
    return acc;
  }, {} as Record<string, StockWithSector[]>);

  // Sort sectors by total market cap
  const sortedSectors = Object.entries(sectors)
    .sort(([, a], [, b]) => {
      const totalA = a.reduce((sum, s) => sum + s.marketCap, 0);
      const totalB = b.reduce((sum, s) => sum + s.marketCap, 0);
      return totalB - totalA;
    });

  // Get color based on change percentage
  const getColor = (changePercent: number) => {
    if (changePercent > 2) return "bg-green-600";
    if (changePercent > 1) return "bg-green-500";
    if (changePercent > 0) return "bg-green-700/70";
    if (changePercent > -1) return "bg-red-700/70";
    if (changePercent > -2) return "bg-red-500";
    return "bg-red-600";
  };

  const getSize = (marketCap: number, sectorTotal: number) => {
    const percentage = (marketCap / sectorTotal) * 100;
    if (percentage > 30) return "large";
    if (percentage > 15) return "medium";
    return "small";
  };

  return (
    <Card className="p-4 md:p-6 bg-card/95 backdrop-blur-sm border-border/50 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedSectors.map(([sectorName, sectorStocks]) => {
          const sectorTotal = sectorStocks.reduce((sum, s) => sum + s.marketCap, 0);
          const sortedStocks = [...sectorStocks].sort((a, b) => b.marketCap - a.marketCap);
          
          return (
            <div key={sectorName} className="border border-border/30 rounded-lg p-3 bg-muted/20">
              <h3 className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                {sectorName}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {sortedStocks.slice(0, 6).map((stock) => {
                  const isPositive = stock.changePercent >= 0;
                  const size = getSize(stock.marketCap, sectorTotal);
                  
                  return (
                    <div
                      key={stock.symbol}
                      className={`
                        ${getColor(stock.changePercent)}
                        rounded p-2 flex flex-col justify-between
                        hover:opacity-90 transition-opacity cursor-pointer
                        ${size === "large" ? "col-span-2 min-h-[80px]" : ""}
                        ${size === "medium" ? "min-h-[70px]" : "min-h-[60px]"}
                      `}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-white font-bold text-sm leading-tight">
                          {stock.symbol}
                        </span>
                        {size === "large" && (
                          <span className="text-white/70 text-[10px] leading-tight">
                            ${stock.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto">
                        <span className="text-white font-semibold text-xs">
                          {isPositive ? "+" : ""}
                          {stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
