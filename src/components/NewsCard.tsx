"use client";

import { Card } from "@/components/ui/card";
import { NewsItem } from "@/lib/stocks";
import Image from "next/image";
import { Clock } from "lucide-react";

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const timeAgo = getTimeAgo(new Date(news.publishedAt));

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {news.imageUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={news.imageUrl}
            alt={news.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">{news.source}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </div>
        </div>
        <h3 className="font-semibold text-lg line-clamp-2">{news.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {news.description}
        </p>
      </div>
    </Card>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";

  return Math.floor(seconds) + "s ago";
}
