import { useState, useEffect } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { fetchLocations } from "@/lib/api";
import type { CampusLocation } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

interface Filters {
  minPrice: string;
  maxPrice: string;
  campusLocation: string;
  minRating: string;
  sortBy: string;
}

interface FilterDrawerProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  activeCount?: number;
}

export function FilterDrawer({ filters, onFiltersChange, activeCount = 0 }: FilterDrawerProps) {
  const [open, setOpen] = useState(false);

  const clearAll = () => {
    onFiltersChange({
      minPrice: "",
      maxPrice: "",
      campusLocation: "",
      minRating: "",
      sortBy: "",
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <Badge className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Price Range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
                className="h-9"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
                className="h-9"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Campus Location</Label>
            <Select
              value={filters.campusLocation}
              onValueChange={(v) => onFiltersChange({ ...filters, campusLocation: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {CAMPUS_LOCATIONS.map((loc) => (
                  <SelectItem key={loc.id} value={String(loc.id)}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Minimum Rating</Label>
            <Select
              value={filters.minRating}
              onValueChange={(v) => onFiltersChange({ ...filters, minRating: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any rating</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={String(r)}>
                    {r}+ stars
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(v) => onFiltersChange({ ...filters, sortBy: v })}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Relevance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Relevance</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="rating_desc">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={() => setOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
