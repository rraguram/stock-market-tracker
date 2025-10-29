"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { NewsItem } from "@/lib/stocks";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const url = category === "all" 
          ? "/api/news" 
          : `/api/news?category=${category}`;
        const response = await fetch(url);
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [category]);

  const categories = [
    { value: "all", label: "All News" },
    { value: "market-trends", label: "Market Trends" },
    { value: "earnings", label: "Earnings" },
    { value: "economy", label: "Economy" },
  ];

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Market News</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest financial news and market insights
          </p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? "default" : "outline"}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-[350px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}