"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { TOP_STOCKS, Stock } from "@/lib/stocks";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface PortfolioItem {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number; // in cents from API
  currentPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=" + encodeURIComponent("/portfolio"));
    }
  }, [session, isPending, router]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/portfolio", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login?redirect=" + encodeURIComponent("/portfolio"));
          return;
        }
        throw new Error("Failed to fetch portfolio");
      }
      const data = await response.json();
      setPortfolio(data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchPortfolio();

      // Fetch current stock prices
      async function fetchStocks() {
        try {
          const response = await fetch("/api/stocks");
          const data = await response.json();
          setStocks(data);
        } catch (error) {
          console.error("Error fetching stocks:", error);
        }
      }
      fetchStocks();
    }
  }, [session]);

  useEffect(() => {
    // Update portfolio with current prices
    if (stocks.length > 0 && portfolio.length > 0) {
      setPortfolio((prevPortfolio) => 
        prevPortfolio.map((item) => {
          const stock = stocks.find((s) => s.symbol === item.symbol);
          return {
            ...item,
            currentPrice: stock?.price || item.currentPrice || 0,
          };
        })
      );
    }
  }, [stocks, portfolio.length]);

  const handleAddStock = async () => {
    const stock = stocks.find((s) => s.symbol === selectedSymbol);
    if (!stock || !quantity || !purchasePrice) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert price from dollars to cents
      const priceInCents = Math.round(parseFloat(purchasePrice) * 100);
      const token = localStorage.getItem("bearer_token");
      
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          quantity: parseInt(quantity),
          purchasePrice: priceInCents,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login?redirect=" + encodeURIComponent("/portfolio"));
          return;
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to add stock");
      }

      toast.success("Stock added to portfolio");
      setIsOpen(false);
      setSelectedSymbol("");
      setQuantity("");
      setPurchasePrice("");
      
      // Refresh portfolio
      await fetchPortfolio();
    } catch (error) {
      console.error("Error adding stock:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStock = async (id: number, symbol: string) => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          router.push("/login?redirect=" + encodeURIComponent("/portfolio"));
          return;
        }
        const error = await response.json();
        throw new Error(error.error || "Failed to remove stock");
      }

      toast.success(`${symbol} removed from portfolio`);
      
      // Refresh portfolio
      await fetchPortfolio();
    } catch (error) {
      console.error("Error removing stock:", error);
      toast.error("Failed to remove stock");
    }
  };

  const calculateStats = () => {
    const totalValue = portfolio.reduce(
      (sum, item) => sum + (item.currentPrice || 0) * item.quantity,
      0
    );
    // Convert purchasePrice from cents to dollars
    const totalCost = portfolio.reduce(
      (sum, item) => sum + (item.purchasePrice / 100) * item.quantity,
      0
    );
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    return { totalValue, totalCost, totalGain, totalGainPercent };
  };

  const stats = calculateStats();

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
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
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
      <main className="container mx-auto px-4 py-8 relative z-10 pb-24 pt-20">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Portfolio Tracker</h1>
            <p className="text-muted-foreground">
              Track your stock investments and performance
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Stock</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock to Portfolio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Stock Symbol</Label>
                  <Select
                    value={selectedSymbol}
                    onValueChange={setSelectedSymbol}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOP_STOCKS.map((stock) => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAddStock} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add to Portfolio"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile: Single Card with Grid Layout */}
        <Card className="p-4 mb-8 md:hidden">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Value</p>
              <p className="text-lg font-bold">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Cost</p>
              <p className="text-lg font-bold">${stats.totalCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gain/Loss</p>
              <p
                className={`text-lg font-bold ${
                  stats.totalGain >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.totalGain >= 0 ? "+" : ""}${stats.totalGain.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Return</p>
              <div
                className={`flex items-center gap-1 text-lg font-bold ${
                  stats.totalGainPercent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.totalGainPercent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {Math.abs(stats.totalGainPercent).toFixed(2)}%
              </div>
            </div>
          </div>
        </Card>

        {/* Tablet: 2x2 Grid of Cards */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4 mb-8">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-2">Total Value</p>
            <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
            <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-2">Total Gain/Loss</p>
            <p
              className={`text-2xl font-bold ${
                stats.totalGain >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.totalGain >= 0 ? "+" : ""}${stats.totalGain.toFixed(2)}
            </p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-2">Return</p>
            <div
              className={`flex items-center gap-2 text-2xl font-bold ${
                stats.totalGainPercent >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.totalGainPercent >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              {Math.abs(stats.totalGainPercent).toFixed(2)}%
            </div>
          </Card>
        </div>

        {/* Desktop: 4 Separate Cards */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Value</p>
            <p className="text-3xl font-bold">${stats.totalValue.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
            <p className="text-3xl font-bold">${stats.totalCost.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Gain/Loss</p>
            <p
              className={`text-3xl font-bold ${
                stats.totalGain >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.totalGain >= 0 ? "+" : ""}${stats.totalGain.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Return</p>
            <div
              className={`flex items-center gap-2 text-3xl font-bold ${
                stats.totalGainPercent >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.totalGainPercent >= 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
              {Math.abs(stats.totalGainPercent).toFixed(2)}%
            </div>
          </Card>
        </div>

        {portfolio.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              Your portfolio is empty. Add stocks to start tracking.
            </p>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Stock
            </Button>
          </Card>
        ) : (
          <>
            {/* Mobile: Card-based Layout */}
            <div className="md:hidden space-y-3">
              {portfolio.map((item) => {
                const purchasePriceInDollars = item.purchasePrice / 100;
                const currentPrice = item.currentPrice || 0;
                const totalValue = currentPrice * item.quantity;
                const totalCost = purchasePriceInDollars * item.quantity;
                const gain = totalValue - totalCost;
                const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;

                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">{item.name}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStock(item.id, item.symbol)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground">Qty</div>
                        <div className="font-medium">{item.quantity}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Current</div>
                        <div className="font-medium">${currentPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Value</div>
                        <div className="font-semibold">${totalValue.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Gain/Loss</div>
                        <div
                          className={`font-semibold ${
                            gain >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {gain >= 0 ? "+" : ""}${gain.toFixed(2)}
                          <span className="text-xs ml-1">
                            ({gainPercent >= 0 ? "+" : ""}
                            {gainPercent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Tablet & Desktop: Table Layout */}
            <Card className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-semibold text-sm">Symbol</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left font-semibold text-sm">Name</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-sm">Qty</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-sm">
                        Purchase
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-sm">
                        Current
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-sm">
                        Value
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-sm">
                        Gain/Loss
                      </th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((item) => {
                      const purchasePriceInDollars = item.purchasePrice / 100;
                      const currentPrice = item.currentPrice || 0;
                      const totalValue = currentPrice * item.quantity;
                      const totalCost = purchasePriceInDollars * item.quantity;
                      const gain = totalValue - totalCost;
                      const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;

                      return (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-sm">
                            {item.symbol}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-muted-foreground text-sm">
                            {item.name}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-right text-sm">{item.quantity}</td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-right text-sm">
                            ${purchasePriceInDollars.toFixed(2)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-right text-sm">
                            ${currentPrice.toFixed(2)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-right font-semibold text-sm">
                            ${totalValue.toFixed(2)}
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-right text-sm">
                            <div
                              className={`font-semibold ${
                                gain >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {gain >= 0 ? "+" : ""}${gain.toFixed(2)}
                              <div className="text-xs">
                                ({gainPercent >= 0 ? "+" : ""}
                                {gainPercent.toFixed(2)}%)
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStock(item.id, item.symbol)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}