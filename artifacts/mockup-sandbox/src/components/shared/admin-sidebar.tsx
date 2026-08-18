import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Flag, BarChart3, ArrowLeft, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin-dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin-dashboard/users", label: "Users", icon: Users },
  { href: "/admin-dashboard/reports", label: "Reports", icon: Flag },
  { href: "/admin-dashboard/categories", label: "Categories", icon: Layers },
  { href: "/admin-dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r bg-background h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex items-center gap-2 px-6 py-4">
        <div className="h-6 w-6 rounded bg-destructive flex items-center justify-center">
          <span className="text-destructive-foreground font-bold text-[10px]">A</span>
        </div>
        <span className="font-semibold text-sm">Admin Panel</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/admin-dashboard"
            ? pathname === "/admin-dashboard"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t">
        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>
    </aside>
  );
}
