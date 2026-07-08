import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Printer, Wrench, BookOpen, Scissors, Sparkles, Package, TrendingUp, ArrowRight, Bell, MessageSquare, ShoppingBag, Clock, UserPlus, MessageCircle, Star, LayoutGrid, Sparkle } from "lucide-react";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      className="flex flex-col items-center gap-2 rounded-xl border bg-card p-3 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-primary/5 group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/10">
        <IconComponent className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-medium leading-tight line-clamp-2 text-foreground/80">{category.name}</span>
      <span className="text-[10px] text-muted-foreground">{count} listings</span>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <section className="relative bg-gradient-to-b from-primary/[0.05] to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </section>
      <section className="bg-muted border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20">
          <Skeleton className="h-4 w-24 mb-6" />
          <div className="grid gap-4 md:grid-cols-4 3xl:grid-cols-6">
            <Skeleton className="md:col-span-1 3xl:col-span-1 h-44 rounded-xl" />
            <Skeleton className="md:col-span-1 3xl:col-span-1 h-44 rounded-xl" />
            <Skeleton className="md:col-span-2 3xl:col-span-2 h-44 rounded-xl" />
          </div>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
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
    <div>
      {/* ── Hero Greeting ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.05] via-primary/[0.02] to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/[0.03] rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">
                  Dashboard
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-base text-foreground/60 mt-1.5">
                {isNewUser ? "Let's get you started on CampusMarket" : "Discover what your campus community has to offer"}
              </p>
            </div>
            {user && user.avg_rating != null && (
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm">
                <StarRating rating={user.avg_rating} size="sm" />
                <span className="text-sm font-semibold text-foreground">
                  {user.avg_rating.toFixed(1)}
                </span>
                <span className="text-xs text-muted-foreground">({user.rating_count})</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      </section>

      {/* ── Overview Bento ── */}
      <section className="bg-muted border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20">
          <div className="flex items-center gap-3 mb-7">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary text-primary-foreground shadow-sm">
                <LayoutGrid className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-semibold text-foreground">Overview</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="grid gap-5 md:grid-cols-4 3xl:grid-cols-6">
            <Card className="md:col-span-1 3xl:col-span-1 bg-gradient-to-br from-primary/5 to-primary/[0.02] border-primary/10 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">Quick Stats</span>
                </div>
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Listings</span>
                    <span className="text-lg font-bold text-foreground">{activeListings.length}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Categories</span>
                    <span className="text-lg font-bold text-foreground">{MOCK_CATEGORIES.length}</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Unread Messages</span>
                    <span className={cn("text-lg font-bold", totalUnread > 0 ? "text-destructive" : "text-foreground")}>
                      {totalUnread}
                    </span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reviews</span>
                    <span className="text-lg font-bold text-foreground">{totalReviews}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1 3xl:col-span-1 border-border/60 shadow-sm">
              <CardContent className="p-5">
                <Link to="/notifications" className="flex items-center gap-2.5 mb-4 group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
                    <Bell className="h-4 w-4 text-amber-500" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Recent Activity</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
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
                      { icon: MessageCircle, text: "New message about Math Tutoring", time: "2m ago" },
                      { text: "Your listing was viewed 15 times", time: "1h ago" },
                      { text: "New listing in Electronics", time: "3h ago" },
                      { icon: Star, text: "New 5-star review received", time: "5h ago" },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className={cn(
                            "flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5",
                            i === 0 ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
                          )}>
                            {Icon && <Icon className="h-3 w-3" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-foreground/80 truncate">{item.text}</p>
                            <span className="text-xs text-muted-foreground">{item.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2 3xl:col-span-4 border-border/60 shadow-sm">
              <CardContent className="p-5">
                <Link to="/categories" className="flex items-center gap-2.5 mb-5 group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                    <LayoutGrid className="h-4 w-4 text-emerald-500" />
                  </div>
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Browse Categories</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
                  {MOCK_CATEGORIES.slice(0, 6).map((category) => (
                    <CategoryTile key={category.id} category={category} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Trending / Recommended ── */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20">
          <div className="flex items-end justify-between mb-7">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-amber-500/10 shadow-sm">
                <Sparkle className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
                <p className="text-sm text-muted-foreground">Based on your interests and activity</p>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-primary/5 text-primary border-primary/10 font-medium">Curated</Badge>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border/60" asChild>
              <Link to="/search">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>

          {recommended.length > 0 ? (
            <StaggerFade className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
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
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
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
