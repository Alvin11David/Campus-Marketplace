import { useState, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { StaggerFade, StaggerItem } from "@/components/shared/stagger-fade";
import { ListingCard } from "@/components/shared/listing-card";
import { FilterDrawer } from "@/components/shared/filter-drawer";
import { apiGet, mapListing } from "@/lib/api";

interface Filters {
  minPrice: string;
  maxPrice: string;
  campusLocation: string;
  minRating: string;
  sortBy: string;
}

const defaultFilters: Filters = {
  minPrice: "",
  maxPrice: "",
  campusLocation: "",
  minRating: "",
  sortBy: "",
};

const PAGE_SIZE = 20;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [editQuery, setEditQuery] = useState(query);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const {
    data,
    isLoading: searching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["search", query, filters],
    queryFn: ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.set("q", query);
      params.set("page", String(pageParam));
      params.set("pageSize", String(PAGE_SIZE));
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.minPrice) params.set("minPrice", filters.minPrice);
      if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
      if (filters.campusLocation && filters.campusLocation !== "all") params.set("campusLocationId", filters.campusLocation);
      return apiGet<any>("/listings/search?" + params.toString()).then((data) => {
        let list = (data.results ?? []).map(mapListing);
        if (filters.minRating && filters.minRating !== "all") {
          const minRat = Number.parseFloat(filters.minRating);
          if (!Number.isNaN(minRat)) {
            list = list.filter((l: any) => l.owner.avg_rating != null && l.owner.avg_rating >= minRat);
          }
        }
        return {
          results: list,
          nextPage: list.length >= PAGE_SIZE ? pageParam + 1 : undefined,
        };
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!query.trim(),
    staleTime: 30_000,
  });

  const results = useMemo(() => data?.pages.flatMap((p) => p.results) ?? [], [data]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (editQuery.trim()) {
        setSearchParams({ q: editQuery.trim() });
      }
    },
    [editQuery, setSearchParams],
  );

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, val]) => key !== "sortBy" && val !== "" && val !== "all")
        .length,
    [filters],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 3xl:max-w-[1600px] 4xl:max-w-[1920px]">
        <div className="flex items-center gap-3 mb-8">
          <BackButton className="-ml-1" />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>

          <form onSubmit={handleSearch} className="mt-4 flex items-center gap-2">
            <div className="relative flex-1 max-w-md group 3xl:max-w-xl 4xl:max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={editQuery}
                onChange={(e) => setEditQuery(e.target.value)}
                placeholder="Search services & products..."
                className="pl-9 h-10 bg-muted/50 focus:bg-background transition-all"
              />
            </div>
            <Button type="submit" size="sm" className="active:scale-95 transition-transform">
              Search
            </Button>
          </form>
        </motion.div></div>

        {query && !searching && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {results.length} result{results.length !== 1 ? "s" : ""} for "<strong>{query}</strong>"
            </p>
            <FilterDrawer
              filters={filters}
              onFiltersChange={setFilters}
              activeCount={activeFilterCount}
            />
          </div>
        )}

        {searching && query ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[16/9] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <StaggerFade className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
              {results.map((listing, i) => (
                <StaggerItem key={listing.id} index={i}>
                  <ListingCard listing={listing} />
                </StaggerItem>
              ))}
            </StaggerFade>

            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="gap-2"
                >
                  {isFetchingNextPage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        ) : query ? (
          <CartoonEmpty
            variant="search"
            title="No listings match your search"
            description="Try different keywords or browse categories to find what you need."
            action={<Button asChild variant="outline" size="sm"><Link to="/categories">Browse Categories</Link></Button>}
          />
        ) : (
          <CartoonEmpty
            variant="explorer"
            title="Search for something"
            description="Enter a search term above to find services and products on campus."
          />
        )}
      </div>
    </div>
  );
}
