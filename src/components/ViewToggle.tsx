"use client";

import { Grid3x3, List, AlignJustify } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "list" | "compact";

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border border-border rounded-lg p-1">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("grid")}
        className="px-3"
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Grid</span>
      </Button>
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="px-3"
      >
        <List className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">List</span>
      </Button>
      <Button
        variant={view === "compact" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onViewChange("compact")}
        className="px-3"
      >
        <AlignJustify className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Compact</span>
      </Button>
    </div>
  );
}
