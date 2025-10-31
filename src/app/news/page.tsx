"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { NewsItem } from "@/lib/stocks";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const response = await fetch("/api/news");
        const data = await response.json();
        setNews(data.slice(0, 10));
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

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
            Stay updated with the latest financial news from FinViz
          </p>
        </div>

        {loading ? (
          <Skeleton className="h-[600px]" />
        ) : (
          <Card className="p-4 bg-card/95 backdrop-blur-sm border-border/50">
            <div className="space-y-1">
              {news.map((item) => {
                const timestamp = new Date(item.publishedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });
                
                const sourceInitial = item.source.charAt(0).toUpperCase();
                const sourceColors = [
                  'bg-blue-600',
                  'bg-green-600',
                  'bg-purple-600',
                  'bg-orange-600',
                  'bg-red-600',
                  'bg-cyan-600'
                ];
                const colorIndex = item.source.charCodeAt(0) % sourceColors.length;
                
                return (
                  <Link 
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`flex-shrink-0 w-6 h-6 ${sourceColors[colorIndex]} rounded flex items-center justify-center text-white text-xs font-bold`}>
                      {sourceInitial}
                    </div>
                    
                    <span className="text-xs text-muted-foreground font-medium min-w-[70px] flex-shrink-0">
                      {timestamp}
                    </span>
                    
                    <span className="text-sm text-cyan-500 group-hover:text-cyan-400 transition-colors flex-1 leading-snug">
                      {item.title}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}