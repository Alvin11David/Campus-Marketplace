import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Printer, Wrench, BookOpen, Scissors, Sparkles, Package, TrendingUp, ArrowRight, Bell, MessageSquare, ShoppingBag, Clock, UserPlus, MessageCircle, Star } from "lucide-react";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingCard } from "@/components/shared/listing-card";
import { StarRating } from "@/components/shared/star-rating";
import { StaggerFade, StaggerItem } from "@/components/shared/stagger-fade";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { MOCK_LISTINGS, MOCK_CATEGORIES, MOCK_CONVERSATIONS, MOCK_NOTIFICATIONS, MOCK_REVIEWS } from "@/lib/mock-data";
import type { Category } from "@/lib/api";

const categoryIconMap: Record<string, typeof Printer> = {
  Printer, Wrench, BookOpen, Scissors, Sparkles, Package,
};

function CategoryTile({ category }: { category: Category }) {
  const IconComponent = categoryIconMap[category.icon_name] || Package;
  const count = MOCK_LISTINGS.filter((l) => l.category.id === category.id && l.status === "active").length;

  return (
    <Link
      to={`/categories/${category.slug}`}
      className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-primary/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary">
        <IconComponent className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-medium leading-tight line-clamp-2">{category.name}</span>
      <span className="text-[10px] text-muted-foreground">{count} listings</span>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4 3xl:grid-cols-6">
        <Skeleton className="md:col-span-1 3xl:col-span-1 h-44 rounded-xl" />
        <Skeleton className="md:col-span-1 3xl:col-span-1 h-44 rounded-xl" />
        <Skeleton className="md:col-span-2 3xl:col-span-2 h-44 rounded-xl" />
      </div>
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const activeListings = MOCK_LISTINGS.filter((l) => l.status === "active");
  const recommended = activeListings.slice(0, 6);
  const totalUnread = MOCK_CONVERSATIONS.reduce((s, c) => s + c.unread_count, 0);
  const unreadNotifs = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;
  const totalReviews = MOCK_REVIEWS.length;

  const myListingCount = user ? MOCK_LISTINGS.filter((l) => l.owner_id === user.id).length : 0;
  const isNewUser = myListingCount === 0 && totalUnread === 0 && unreadNotifs === 0;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isNewUser ? "Let's get you started on CampusMarket" : "Discover what your campus community has to offer"}
          </p>
        </div>
        {user && user.avg_rating != null && (
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground">
            <StarRating rating={user.avg_rating} size="sm" />
            <span className="text-xs">
              {user.avg_rating.toFixed(1)} ({user.rating_count})
            </span>
          </div>
        )}
      </div>

      {/* Bento Grid */}
      <div className="grid gap-4 md:grid-cols-4 3xl:grid-cols-6">
        <Card className="md:col-span-1 3xl:col-span-1 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingBag className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium">Quick Stats</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Listings</span>
                <span className="text-sm font-semibold">{activeListings.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Categories</span>
                <span className="text-sm font-semibold">{MOCK_CATEGORIES.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Unread Messages</span>
                <span className={totalUnread > 0 ? "text-sm font-semibold text-destructive" : "text-sm font-semibold"}>
                  {totalUnread}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reviews</span>
                <span className="text-sm font-semibold">{totalReviews}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 3xl:col-span-1 border-primary/5">
          <CardContent className="p-5">
            <Link to="/notifications" className="flex items-center gap-2 mb-4 group">
              <div className="p-2 rounded-lg bg-secondary/10">
                <Bell className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Recent Activity</span>
              <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            {isNewUser ? (
              <CartoonEmpty
                variant="activity"
                title="Your activity will appear here"
                description="Create your first listing to get started"
                action={<Button variant="outline" size="sm" asChild><Link to="/listings/new">Create your first listing</Link></Button>}
              />
            ) : (
              <div className="space-y-3">
                {[
                  { icon: MessageCircle, text: "New message about Math Tutoring", time: "2m ago", color: "text-blue-500" },
                  { text: "Your listing was viewed 15 times", time: "1h ago" },
                  { text: "New listing in Electronics", time: "3h ago" },
                  { icon: Star, text: "New 5-star review received", time: "5h ago", color: "text-amber-500" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                        i === 0 ? "bg-primary" : "bg-primary/30"
                      )} />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{item.text}</p>
                        <span className="text-[10px] text-muted-foreground/60">{item.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 3xl:col-span-4 border-primary/5">
          <CardContent className="p-5">
            <Link to="/categories" className="flex items-center gap-2 mb-4 group">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Browse Categories</span>
              <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
              {MOCK_CATEGORIES.slice(0, 6).map((category) => (
                <CategoryTile key={category.id} category={category} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Recommended for You</h2>
            <Badge variant="secondary" className="text-[10px]">Recommended</Badge>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
            <Link to="/search">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        {recommended.length > 0 ? (
          <StaggerFade className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
            {recommended.map((listing, i) => (
              <StaggerItem key={listing.id} index={i}>
                <ListingCard listing={listing} />
              </StaggerItem>
            ))}
          </StaggerFade>
        ) : (
          <CartoonEmpty
            variant="package"
            title="No listings available yet"
            description="Check back soon for new listings from your campus community"
          />
        )}
      </section>

      {/* FAB - New Listing */}
      {(user?.is_provider || user?.is_seller) && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-6 md:right-6">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 md:h-12 md:w-auto md:rounded-full md:px-6"
            asChild
          >
            <Link to="/listings/new" className="flex items-center justify-center gap-2">
              <Plus className="h-6 w-6 md:h-5 md:w-5" />
              <span className="hidden md:inline">New Listing</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
