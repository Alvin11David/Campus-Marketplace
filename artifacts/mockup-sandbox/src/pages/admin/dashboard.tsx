import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, ShoppingBag, MessageSquare, Star, Flag, BarChart3, TrendingUp, TrendingDown,
  UserPlus, ThumbsUp, AlertTriangle, Search, ShieldAlert, Ban, UserCheck, XCircle,
  MessageCircle, CheckCircle2, Layers, Package,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiGet, absoluteUrl } from "@/lib/api";
import type { AdminAnalytics } from "@/lib/api";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  bgClass: string;
  iconClass: string;
  trend?: { value: number; positive: boolean };
}

function KpiCard({ label, value, icon: Icon, bgClass, iconClass, trend }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg shrink-0", bgClass)}>
              <Icon className={cn("h-6 w-6", iconClass)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground truncate">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium shrink-0",
                trend.positive ? "text-emerald-600" : "text-destructive"
              )}>
                {trend.positive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {trend.value}%
              </div>
            )}
          </div>
        </CardContent>
        <div className={cn("absolute bottom-0 left-0 right-0 h-0.5", bgClass)} />
      </Card>
    </motion.div>
  );
}

const quickLinks = [
  { href: "/admin-dashboard/users", label: "Manage Users", icon: Users, variant: "outline" as const },
  { href: "/admin-dashboard/reports", label: "View Reports", icon: Flag, variant: "outline" as const },
  { href: "/admin-dashboard/analytics", label: "Analytics", icon: BarChart3, variant: "outline" as const },
  { href: "/admin-dashboard/categories", label: "Categories", icon: Layers, variant: "outline" as const },
];

const actionLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  suspend_user: { label: "User Suspended", icon: Ban, color: "text-destructive" },
  reactivate_user: { label: "User Reactivated", icon: UserCheck, color: "text-emerald-600" },
  deactivate_listing: { label: "Listing Deactivated", icon: Ban, color: "text-destructive" },
  delete_review: { label: "Review Removed", icon: XCircle, color: "text-orange-600" },
  verify_user: { label: "User Verified", icon: CheckCircle2, color: "text-blue-600" },
  dismiss_report: { label: "Report Dismissed", icon: XCircle, color: "text-muted-foreground" },
};

const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))"];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getActionLabel(action: string) {
  return actionLabels[action] ?? { label: action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), icon: ShieldAlert, color: "text-muted-foreground" };
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

  const kpiCards: KpiCardProps[] = [
    {
      label: "Total Users",
      value: analytics?.total_users ?? 0,
      icon: Users,
      bgClass: "bg-blue-50 dark:bg-blue-950/40",
      iconClass: "text-blue-600 dark:text-blue-400",
      trend: { value: 21, positive: true },
    },
    {
      label: "Active Listings",
      value: analytics?.total_active_listings ?? 0,
      icon: ShoppingBag,
      bgClass: "bg-green-50 dark:bg-green-950/40",
      iconClass: "text-green-600 dark:text-green-400",
      trend: { value: 8, positive: true },
    },
    {
      label: "Pending Reports",
      value: analytics?.pending_reports_count ?? 0,
      icon: AlertTriangle,
      bgClass: "bg-red-50 dark:bg-red-950/40",
      iconClass: "text-red-600 dark:text-red-400",
    },
    {
      label: "Messages Sent",
      value: analytics?.total_messages_sent ?? 0,
      icon: MessageSquare,
      bgClass: "bg-amber-50 dark:bg-amber-950/40",
      iconClass: "text-amber-600 dark:text-amber-400",
      trend: { value: 12, positive: true },
    },
    {
      label: "Platform Rating",
      value: analytics?.platform_avg_rating != null ? Number(analytics.platform_avg_rating).toFixed(1) : "0.0",
      icon: Star,
      bgClass: "bg-purple-50 dark:bg-purple-950/40",
      iconClass: "text-purple-600 dark:text-purple-400",
      trend: { value: 3, positive: true },
    },
    {
      label: "New Users (This Week)",
      value: analytics?.new_users_this_week ?? 0,
      icon: UserPlus,
      bgClass: "bg-cyan-50 dark:bg-cyan-950/40",
      iconClass: "text-cyan-600 dark:text-cyan-400",
      trend: { value: 15, positive: true },
    },
    {
      label: "Total Reviews",
      value: analytics?.total_reviews_submitted ?? 0,
      icon: ThumbsUp,
      bgClass: "bg-pink-50 dark:bg-pink-950/40",
      iconClass: "text-pink-600 dark:text-pink-400",
      trend: { value: 5, positive: true },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your campus marketplace platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 w-32 sm:w-36"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 w-32 sm:w-36"
            />
            {(fromDate || toDate) && (
              <Badge variant="secondary" className="h-7 text-xs">
                Filtered
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-7">
        {kpiCards.map((kpi, index) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Listings by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                Service vs Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length > 0 ? (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--popover))",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 text-xs text-muted-foreground mt-1">
                    {pieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                        {d.name}: {d.value}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No data</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Flag className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Button key={link.href} variant={link.variant} className="w-full justify-start gap-3" asChild>
                    <Link to={link.href}>
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Recent Admin Activity
            </CardTitle>
            <CardDescription>Latest moderation actions taken on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recent_admin_actions && analytics.recent_admin_actions.length > 0 ? (
              <div className="space-y-0 divide-y">
                {analytics.recent_admin_actions.slice(0, 8).map((action) => {
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Top Providers
            </CardTitle>
            <CardDescription>Highest rated providers & sellers</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.top_providers && analytics.top_providers.length > 0 ? (
              <div className="space-y-3">
                {analytics.top_providers.map((provider, i) => (
                  <div key={provider.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">{i + 1}</span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={absoluteUrl(provider.profile_photo_url) ?? undefined} />
                      <AvatarFallback className="text-[10px]">{getInitials(provider.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{provider.full_name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{provider.listing_count} listing{provider.listing_count !== 1 ? "s" : ""}</span>
                        <span className="text-xs text-muted-foreground/40">&middot;</span>
                        <span className="flex items-center gap-0.5 text-xs text-amber-500">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Top Search Terms
          </CardTitle>
          <CardDescription>Most common search queries from students</CardDescription>
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
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors hover:bg-accent"
                    style={{
                      backgroundColor: `hsl(var(--primary) / ${intensity * 0.15})`,
                      borderColor: `hsl(var(--primary) / ${intensity * 0.3})`,
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
    </div>
  );
}
