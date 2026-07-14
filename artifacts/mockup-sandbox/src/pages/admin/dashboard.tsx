import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, ShoppingBag, MessageSquare, Star, Flag, BarChart3, TrendingUp, TrendingDown,
  UserPlus, ThumbsUp, AlertTriangle, Search, ShieldAlert, Ban, UserCheck, XCircle,
  CheckCircle2, Layers, Package, ArrowRight, LayoutGrid, Sparkle, Activity,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { apiGet, absoluteUrl } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import type { AdminAnalytics } from "@/lib/api";

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getActionLabel(action: string) {
  const map: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    suspend_user: { label: "User Suspended", icon: Ban, color: "text-destructive" },
    reactivate_user: { label: "User Reactivated", icon: UserCheck, color: "text-emerald-600" },
    deactivate_listing: { label: "Listing Deactivated", icon: Ban, color: "text-destructive" },
    delete_review: { label: "Review Removed", icon: XCircle, color: "text-orange-600" },
    verify_user: { label: "User Verified", icon: CheckCircle2, color: "text-blue-600" },
    dismiss_report: { label: "Report Dismissed", icon: XCircle, color: "text-muted-foreground" },
  };
  return map[action] ?? { label: action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), icon: ShieldAlert, color: "text-muted-foreground" };
}

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  useEffect(() => {
    apiGet<AdminAnalytics>("/admin/analytics/overview")
      .then(setAnalytics)
      .catch(() => {});
  }, []);

  const chartData = useMemo(() => {
    if (!analytics?.listings_by_category) return [];
    return analytics.listings_by_category.map((d: any) => ({
      category: d.category_name ?? d.category,
      count: d.listing_count ?? d.count,
    }));
  }, [analytics]);

  const pieData = useMemo(() => {
    const split = analytics?.service_product_split;
    if (!split) return [];
    return [
      { name: "Services", value: split.service ?? 0 },
      { name: "Products", value: split.product ?? 0 },
    ].filter((d) => d.value > 0);
  }, [analytics]);

  const quickNav = [
    { href: "/admin-dashboard/users", label: "Manage Users", icon: Users, desc: `${analytics?.total_users ?? 0} registered` },
    { href: "/admin-dashboard/reports", label: "Moderation", icon: Flag, desc: `${analytics?.pending_reports_count ?? 0} pending` },
    { href: "/admin-dashboard/analytics", label: "Analytics", icon: BarChart3, desc: "Detailed reports" },
    { href: "/admin-dashboard/categories", label: "Categories", icon: Layers, desc: "Manage listing types" },
  ];

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-destructive/[0.06] via-destructive/[0.02] to-transparent">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-destructive/[0.04] rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/[0.03] rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-2 w-2 rounded-full bg-destructive ring-2 ring-destructive/20" />
                <span className="text-xs font-semibold text-foreground/50 uppercase tracking-widest">Admin</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Welcome{user?.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}
              </h1>
              <p className="text-base text-foreground/60 mt-1.5">
                Platform overview and moderation at a glance
              </p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-destructive/15 to-transparent" />
      </section>

      {/* ── Metrics Bento ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16">
        <div className="flex items-center gap-3 mb-7">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-destructive text-destructive-foreground shadow-sm">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-foreground">Platform Metrics</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
        </div>

        <div className="grid gap-5 md:grid-cols-4 3xl:grid-cols-8">
          <div className="md:col-span-1 3xl:col-span-1 space-y-5">
            <Card className="bg-gradient-to-br from-destructive/5 to-destructive/[0.02] border-destructive/10 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Reports</p>
                    <p className="text-2xl font-bold">{analytics?.pending_reports_count ?? 0}</p>
                  </div>
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{analytics?.total_users ?? 0}</p>
                  </div>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <UserPlus className="h-3 w-3 mr-1" />
                  {analytics?.new_users_this_week ?? 0} new this week
                </div>
              </CardContent>
            </Card>

            {quickNav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => navigate(item.href)}
                  className="w-full text-left group"
                >
                  <Card className="border-border/60 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/5 shrink-0 group-hover:bg-primary/10 transition-colors">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>

          <Card className="md:col-span-2 3xl:col-span-4 border-border/60 shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                  <ShoppingBag className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Listings by Category</CardTitle>
                  <CardDescription>{analytics?.total_active_listings ?? 0} active listings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} className="text-muted-foreground" angle={-20} textAnchor="end" height={60} />
                    <YAxis className="text-muted-foreground text-xs" allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-1 3xl:col-span-1 space-y-5">
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10">
                    <Package className="h-4 w-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Listings by Type</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <div>
                    <div className="h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4} dataKey="value">
                            {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground mt-1">
                      {pieData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                          {d.name}: {d.value}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-6 text-center">No data</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
                    <Star className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">Rating</CardTitle>
                    <CardDescription>Platform average</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-4xl font-bold text-foreground">
                  {analytics?.platform_avg_rating != null ? Number(analytics.platform_avg_rating).toFixed(1) : "—"}
                </p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-3.5 w-3.5",
                        analytics && star <= Math.round(Number(analytics.platform_avg_rating))
                          ? "text-amber-400 fill-amber-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">{analytics?.total_reviews_submitted ?? 0} reviews</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Bottom Row ── */}
      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16">
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent Admin Activity */}
          <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
                  <ShieldAlert className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
                  <CardDescription>Latest moderation actions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.recent_admin_actions && analytics.recent_admin_actions.length > 0 ? (
                <div className="space-y-0 divide-y">
                  {analytics.recent_admin_actions.slice(0, 7).map((action) => {
                    const meta = getActionLabel(action.action);
                    const Icon = meta.icon;
                    return (
                      <div key={action.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted", meta.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{meta.label}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {action.notes ? action.notes : `${action.target_type} #${action.target_id}`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-muted-foreground/60">{action.admin_name}</span>
                            <span className="text-[10px] text-muted-foreground/40">&middot;</span>
                            <span className="text-[10px] text-muted-foreground/60">{timeAgo(action.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No admin actions yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top Providers */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Top Providers</CardTitle>
                  <CardDescription>Highest rated</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analytics?.top_providers && analytics.top_providers.length > 0 ? (
                <div className="space-y-3">
                  {analytics.top_providers.slice(0, 5).map((provider, i) => (
                    <div key={provider.id} className="flex items-center gap-3">
                      <span className={cn(
                        "text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                        i === 0 ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" :
                        i === 1 ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                        i === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" :
                        "text-muted-foreground"
                      )}>
                        {i + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={absoluteUrl(provider.profile_photo_url) ?? undefined} />
                        <AvatarFallback className="text-[10px]">{getInitials(provider.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate leading-tight">{provider.full_name}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span>{provider.listing_count} listing{provider.listing_count !== 1 ? "s" : ""}</span>
                          <span>&middot;</span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="h-3 w-3 fill-current" />
                            {provider.avg_rating?.toFixed(1) ?? "N/A"}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {provider.is_provider && provider.is_seller ? "Both" : provider.is_provider ? "Provider" : "Seller"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No providers yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Search Terms */}
        <Card className="mt-6 border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10">
                <Search className="h-4 w-4 text-cyan-500" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Top Search Terms</CardTitle>
                <CardDescription>What students are looking for</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analytics?.top_search_terms && analytics.top_search_terms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.top_search_terms.map((term) => {
                  const maxCount = Math.max(...analytics.top_search_terms.map((t) => t.count));
                  const intensity = 0.3 + (term.count / maxCount) * 0.7;
                  return (
                    <span
                      key={term.query}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all hover:bg-accent cursor-default"
                      style={{
                        backgroundColor: `hsl(var(--primary) / ${intensity * 0.12})`,
                        borderColor: `hsl(var(--primary) / ${intensity * 0.25})`,
                      }}
                    >
                      {term.query}
                      <span className="text-[10px] text-muted-foreground font-medium">{term.count}</span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-6 text-center">No search data yet</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
