import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Printer, Wrench, BookOpen, Scissors, Sparkles, Package } from "lucide-react";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { ListingCard } from "@/components/shared/listing-card";
import { FilterDrawer } from "@/components/shared/filter-drawer";
import { MOCK_CATEGORIES, MOCK_LISTINGS } from "@/lib/mock-data";
import { CATEGORY_ICONS, CAMPUS_LOCATIONS } from "@/lib/api";
import type { Listing } from "@/lib/api";

const iconMap: Record<string, React.ElementType> = {
  Printer, Wrench, BookOpen,
  Scissors, Sparkles, Package,
};

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

function CategoryPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Skeleton className="h-9 w-32 mb-6" />
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [slug]);

  const category = useMemo(
    () => MOCK_CATEGORIES.find((c) => c.slug === slug),
    [slug],
  );

  const filteredListings = useMemo(() => {
    if (!category) return [];

    let list = MOCK_LISTINGS.filter(
      (l) => l.category.name === category.name && l.status === "active",
    );

    if (filters.minPrice) {
      const min = Number.parseFloat(filters.minPrice);
      if (!Number.isNaN(min)) {
        list = list.filter((l) => Number.parseFloat(l.price) >= min);
      }
    }
    if (filters.maxPrice) {
      const max = Number.parseFloat(filters.maxPrice);
      if (!Number.isNaN(max)) {
        list = list.filter((l) => Number.parseFloat(l.price) <= max);
      }
    }
    if (filters.campusLocation && filters.campusLocation !== "all") {
      const locId = Number.parseInt(filters.campusLocation, 10);
      list = list.filter((l) => l.campus_location_id === locId);
    }
    if (filters.minRating && filters.minRating !== "all") {
      const minRat = Number.parseFloat(filters.minRating);
      if (!Number.isNaN(minRat)) {
        list = list.filter((l) => l.avg_rating != null && l.avg_rating >= minRat);
      }
    }

    switch (filters.sortBy) {
      case "price_asc":
        list.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price));
        break;
      case "price_desc":
        list.sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price));
        break;
      case "rating_desc":
        list.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0));
        break;
      case "newest":
        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return list;
  }, [category, filters]);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, val]) => key !== "sortBy" && val !== "" && val !== "all")
        .length,
    [filters],
  );

  if (!category) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <BackButton fallback="/categories" label="Back to Categories" className="mb-6" />
        <CartoonEmpty
          variant="shelf"
          title="Category not found"
          description="The category you're looking for doesn't exist."
        />
      </div>
    );
  }

  if (loading) return <CategoryPageSkeleton />;

  const iconName = CATEGORY_ICONS[category.name] || "Package";
  const Icon = iconMap[iconName] || Package;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <BackButton fallback="/categories" label="Back to Categories" className="mb-6" />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
              {category.description && (
                <p className="mt-1 text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} found
          </p>
          <FilterDrawer
            filters={filters}
            onFiltersChange={setFilters}
            activeCount={activeFilterCount}
          />
        </div>

        {filteredListings.length === 0 ? (
          <CartoonEmpty
            variant="shelf"
            title="No listings in this category"
            description="Try adjusting your filters or check back later for new listings."
            action={<Button variant="outline" size="sm" asChild><Link to="/categories">Browse All Categories</Link></Button>}
          />
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
                }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
