import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ShoppingBag, MessageSquare, Star, Flag, BarChart3, TrendingUp, TrendingDown, UserPlus, MessageCircle, ThumbsUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";

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
  { href: "/admin-dashboard/categories", label: "Categories", icon: BarChart3, variant: "outline" as const },
];

export default function AdminDashboard() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const chartData = useMemo(() => {
    let data = MOCK_ANALYTICS.listings_by_category;
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      data = data
        .filter(() => Math.random() > 0.3)
        .map((d) => ({
          ...d,
          count: Math.max(1, d.count - (fromDate ? 1 : 0) - (toDate ? 1 : 0)),
        }))
        .filter((d) => d.count > 0);
    }
    return data;
  }, [fromDate, toDate]);

  const kpiCards: KpiCardProps[] = [
    {
      label: "Total Users",
      value: MOCK_ANALYTICS.total_users,
      icon: Users,
      bgClass: "bg-blue-50 dark:bg-blue-950/40",
      iconClass: "text-blue-600 dark:text-blue-400",
      trend: { value: 21, positive: true },
    },
    {
      label: "Active Listings",
      value: MOCK_ANALYTICS.total_active_listings,
      icon: ShoppingBag,
      bgClass: "bg-green-50 dark:bg-green-950/40",
      iconClass: "text-green-600 dark:text-green-400",
      trend: { value: 8, positive: true },
    },
    {
      label: "Messages Sent",
      value: MOCK_ANALYTICS.total_messages_sent,
      icon: MessageSquare,
      bgClass: "bg-amber-50 dark:bg-amber-950/40",
      iconClass: "text-amber-600 dark:text-amber-400",
      trend: { value: 12, positive: true },
    },
    {
      label: "Platform Rating",
      value: MOCK_ANALYTICS.platform_avg_rating.toFixed(1),
      icon: Star,
      bgClass: "bg-purple-50 dark:bg-purple-950/40",
      iconClass: "text-purple-600 dark:text-purple-400",
      trend: { value: 3, positive: true },
    },
    {
      label: "New Users (This Week)",
      value: MOCK_ANALYTICS.new_users_this_week,
      icon: UserPlus,
      bgClass: "bg-cyan-50 dark:bg-cyan-950/40",
      iconClass: "text-cyan-600 dark:text-cyan-400",
      trend: { value: 15, positive: true },
    },
    {
      label: "Total Reviews",
      value: MOCK_ANALYTICS.total_reviews_submitted,
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

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
        {kpiCards.map((kpi, index) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 3xl:grid-cols-4">
        <Card className="lg:col-span-2 3xl:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Listings by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
  );
}
