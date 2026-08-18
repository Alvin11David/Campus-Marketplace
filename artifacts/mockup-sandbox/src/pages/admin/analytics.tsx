import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Users, ShoppingBag, MessageSquare, Star, UserPlus, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiGet } from "@/lib/api";

const dailyData = [
  { date: "Mon", users: 12, searches: 45, messages: 28 },
  { date: "Tue", users: 15, searches: 52, messages: 32 },
  { date: "Wed", users: 18, searches: 48, messages: 35 },
  { date: "Thu", users: 14, searches: 55, messages: 30 },
  { date: "Fri", users: 20, searches: 60, messages: 40 },
  { date: "Sat", users: 10, searches: 30, messages: 18 },
  { date: "Sun", users: 8, searches: 25, messages: 15 },
];



export default function AdminAnalytics() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    apiGet<any>("/admin/analytics/overview")
      .then(setAnalytics)
      .catch(() => {});
  }, []);

  const categoryChartData = (analytics?.listings_by_category ?? []).map((d: any) => ({
    category: d.category_name,
    count: d.listing_count,
  }));

  const statCards = [
    { label: "Total Users", value: analytics?.total_users ?? 0, icon: Users, bgClass: "bg-blue-50 dark:bg-blue-950/40", iconClass: "text-blue-600 dark:text-blue-400" },
    { label: "New This Week", value: analytics?.new_users_this_week ?? 0, icon: UserPlus, bgClass: "bg-emerald-50 dark:bg-emerald-950/40", iconClass: "text-emerald-600 dark:text-emerald-400" },
    { label: "Active Listings", value: analytics?.total_active_listings ?? 0, icon: ShoppingBag, bgClass: "bg-green-50 dark:bg-green-950/40", iconClass: "text-green-600 dark:text-green-400" },
    { label: "Total Messages", value: analytics?.total_messages_sent ?? 0, icon: MessageSquare, bgClass: "bg-amber-50 dark:bg-amber-950/40", iconClass: "text-amber-600 dark:text-amber-400" },
    { label: "Total Reviews", value: analytics?.total_reviews_submitted ?? 0, icon: FileText, bgClass: "bg-rose-50 dark:bg-rose-950/40", iconClass: "text-rose-600 dark:text-rose-400" },
    { label: "Avg Rating", value: analytics?.platform_avg_rating != null ? Number(analytics.platform_avg_rating).toFixed(1) : "0.0", icon: Star, bgClass: "bg-purple-50 dark:bg-purple-950/40", iconClass: "text-purple-600 dark:text-purple-400" },
  ];

  const handleExportCSV = () => {
    const headers = ["Metric", "Value"];
    const rows: string[][] = [
      ["Total Users", String(analytics?.total_users ?? 0)],
      ["New This Week", String(analytics?.new_users_this_week ?? 0)],
      ["Active Listings", String(analytics?.total_active_listings ?? 0)],
      ["Total Messages", String(analytics?.total_messages_sent ?? 0)],
      ["Total Reviews", String(analytics?.total_reviews_submitted ?? 0)],
      ["Avg Rating", analytics?.platform_avg_rating != null ? Number(analytics.platform_avg_rating).toFixed(1) : "0.0"],
      ...(fromDate ? [["From Date", fromDate]] : []),
      ...(toDate ? [["To Date", toDate]] : []),
      [],
      ["Category", "Listings"],
      ...categoryChartData.map((c: any) => [c.category, String(c.count)]),
      [],
      ["Date", "Active Users", "Searches", "Messages"],
      ...dailyData.map((d) => [d.date, String(d.users), String(d.searches), String(d.messages)]),
    ];
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${fromDate || "all"}-${toDate || "all"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Analytics exported", { description: "CSV file has been downloaded." });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform metrics, user activity, and growth trends
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 w-36"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 w-36"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", stat.bgClass)}>
                      <Icon className={cn("h-5 w-5", stat.iconClass)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                      <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Active Users</CardTitle>
            <CardDescription>User activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-muted-foreground text-xs" />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Active Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="searches"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Searches"
                  />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Messages"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listings by Category</CardTitle>
            <CardDescription>Distribution of active listings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis className="text-muted-foreground text-xs" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      background: "hsl(var(--popover))",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Listings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
