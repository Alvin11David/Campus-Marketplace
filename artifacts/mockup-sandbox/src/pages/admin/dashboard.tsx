import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, ShoppingBag, MessageSquare, Star, Flag, BarChart3, TrendingUp, TrendingDown,
  UserPlus, ThumbsUp, AlertTriangle, Search, ShieldAlert, Ban, UserCheck, XCircle,
  CheckCircle2, Layers, Package, ArrowRight, Activity,
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

const MOCK_METRICS = {
  total_users: 34, total_active_listings: 22, pending_reports_count: 2,
  total_messages_sent: 210, platform_avg_rating: 4.2, new_users_this_week: 5,
  total_reviews_submitted: 18,
};

const MOCK_PIE = [
  { name: "Services", value: 12 },
  { name: "Products", value: 10 },
];

const MOCK_CATEGORIES = [
  { category: "Printing & Photocopying", count: 4 },
  { category: "Device Repair", count: 6 },
  { category: "Tutoring", count: 5 },
  { category: "Hair & Beauty", count: 3 },
  { category: "Laundry & Event Planning", count: 2 },
  { category: "Campus Products", count: 7 },
];

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  iconColor: string;
  trend: { value: number; positive: boolean };
}

function MetricCard({ label, value, icon: Icon, gradient, iconBg, iconColor, trend }: MetricCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`border-border/60 shadow-sm overflow-hidden ${gradient}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl shrink-0", iconBg)}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <div className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend.positive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
            )}>
              {trend.positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
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

  const a = analytics ?? MOCK_METRICS;

  const chartData = useMemo(() => {
    if (analytics?.listings_by_category?.length) {
      return analytics.listings_by_category.map((d: any) => ({
        category: d.category_name ?? d.category,
        count: d.listing_count ?? d.count,
      }));
    }
    return MOCK_CATEGORIES;
  }, [analytics]);

  const pieData = useMemo(() => {
    if (analytics?.service_product_split) {
      const split = analytics.service_product_split;
      return [
        { name: "Services", value: split.service ?? 0 },
        { name: "Products", value: split.product ?? 0 },
      ].filter((d) => d.value > 0);
    }
    return MOCK_PIE;
  }, [analytics]);

  const quickNav = [
    { href: "/admin-dashboard/users", label: "Manage Users", icon: Users, desc: `${(analytics?.total_users ?? MOCK_METRICS.total_users)} registered` },
    { href: "/admin-dashboard/reports", label: "Moderation", icon: Flag, desc: `${(analytics?.pending_reports_count ?? MOCK_METRICS.pending_reports_count)} pending` },
    { href: "/admin-dashboard/analytics", label: "Analytics", icon: BarChart3, desc: "Detailed reports" },
    { href: "/admin-dashboard/categories", label: "Categories", icon: Layers, desc: "Manage listing types" },
  ];

  const metrics: MetricCardProps[] = [
    { label: "Total Users", value: a.total_users, icon: Users, gradient: "bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/20 dark:to-background", iconBg: "bg-blue-100 dark:bg-blue-900/50", iconColor: "text-blue-600 dark:text-blue-400", trend: { value: 21, positive: true } },
    { label: "Active Listings", value: a.total_active_listings, icon: ShoppingBag, gradient: "bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-background", iconBg: "bg-emerald-100 dark:bg-emerald-900/50", iconColor: "text-emerald-600 dark:text-emerald-400", trend: { value: 8, positive: true } },
    { label: "Pending Reports", value: a.pending_reports_count, icon: AlertTriangle, gradient: "bg-gradient-to-br from-red-50/80 to-white dark:from-red-950/20 dark:to-background", iconBg: "bg-red-100 dark:bg-red-900/50", iconColor: "text-red-600 dark:text-red-400", trend: { value: 0, positive: false } },
    { label: "Messages Sent", value: a.total_messages_sent, icon: MessageSquare, gradient: "bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-background", iconBg: "bg-amber-100 dark:bg-amber-900/50", iconColor: "text-amber-600 dark:text-amber-400", trend: { value: 12, positive: true } },
    { label: "Platform Rating", value: a.platform_avg_rating != null ? Number(a.platform_avg_rating).toFixed(1) : "—", icon: Star, gradient: "bg-gradient-to-br from-purple-50/80 to-white dark:from-purple-950/20 dark:to-background", iconBg: "bg-purple-100 dark:bg-purple-900/50", iconColor: "text-purple-600 dark:text-purple-400", trend: { value: 3, positive: true } },
    { label: "New Users (Week)", value: a.new_users_this_week, icon: UserPlus, gradient: "bg-gradient-to-br from-cyan-50/80 to-white dark:from-cyan-950/20 dark:to-background", iconBg: "bg-cyan-100 dark:bg-cyan-900/50", iconColor: "text-cyan-600 dark:text-cyan-400", trend: { value: 15, positive: true } },
    { label: "Total Reviews", value: a.total_reviews_submitted, icon: ThumbsUp, gradient: "bg-gradient-to-br from-pink-50/80 to-white dark:from-pink-950/20 dark:to-background", iconBg: "bg-pink-100 dark:bg-pink-900/50", iconColor: "text-pink-600 dark:text-pink-400", trend: { value: 5, positive: true } },
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

      {/* ── Metric Cards ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-7">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </section>

      {/* ── Charts Row ── */}
      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16">
        <div className="grid gap-6 lg:grid-cols-3">

          <Card className="lg:col-span-2 border-border/60 shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
                  <ShoppingBag className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Listings by Category</CardTitle>
                  <CardDescription>{analytics?.total_active_listings ?? MOCK_METRICS.total_active_listings} active listings</CardDescription>
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

          <div className="space-y-6">
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
                <div>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={4} dataKey="value">
                          {pieData.map((_, i) => (<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                    {pieData.map((d, i) => {
                      const total = pieData.reduce((s, x) => s + x.value, 0);
                      return (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                          {d.name}: {Math.round((d.value / total) * 100)}% ({d.value})
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
                    <Star className="h-4 w-4 text-purple-500" />
                  </div>
                  <CardTitle className="text-sm font-semibold">Platform Rating</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{analytics?.platform_avg_rating != null ? Number(analytics.platform_avg_rating).toFixed(1) : MOCK_METRICS.platform_avg_rating.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">avg rating</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= Math.round(analytics?.platform_avg_rating ?? MOCK_METRICS.platform_avg_rating);
                        return <Star key={star} className={cn("h-4 w-4", filled ? "text-amber-400 fill-amber-400" : "text-muted-foreground/25")} />;
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{analytics?.total_reviews_submitted ?? MOCK_METRICS.total_reviews_submitted} reviews</p>
                  </div>
                </div>
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
