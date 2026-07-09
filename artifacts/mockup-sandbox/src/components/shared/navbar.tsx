import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bell, MessageSquare, User, LogOut, PlusCircle, Search, Menu, X, LayoutDashboard, LayoutGrid, MessageCircle, BellRing, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { apiGet } from "@/lib/api";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/notifications", label: "Notifications", icon: BellRing },
  { href: "/my-listings", label: "My Listings", icon: List },
  { href: "/profile/me", label: "Profile", icon: User },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  if (!user) return null;

  const totalUnread = MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unread_count, 0);
  const unreadNotifications = MOCK_NOTIFICATIONS.filter((n) => !n.is_read).length;

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-transparent bg-background/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/30 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full">
              {/* User card at top */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                    <AvatarImage src={user?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-sm font-bold">{initials || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                {(user?.is_provider || user?.is_seller) && (
                  <Button size="sm" className="w-full gap-2 shadow-lg shadow-primary/20" asChild>
                    <Link to="/listings/new" onClick={() => {}}>
                      <PlusCircle className="h-4 w-4" />
                      New Listing
                    </Link>
                  </Button>
                )}
              </div>

              <nav className="flex-1 flex flex-col gap-1 p-4">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      to={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive(link.href)
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <link.icon className={cn(
                        "h-4 w-4 shrink-0",
                        isActive(link.href) ? "text-primary" : ""
                      )} />
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>

              <Separator />
              <div className="p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/dashboard" className="flex items-center gap-2 shrink-0 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/30">
            <span className="text-primary-foreground font-bold text-sm">CM</span>
          </div>
          <span className="hidden sm:inline font-bold text-lg tracking-tight">CampusMarket</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4 3xl:max-w-xl 4xl:max-w-2xl">
          <div className="relative w-full group">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300",
              searchFocused ? "text-primary" : "text-muted-foreground"
            )} />
            <Input
              placeholder="Search services & products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "pl-9 h-9 bg-muted/50 transition-all duration-300",
                searchFocused
                  ? "bg-background ring-2 ring-primary/20 shadow-lg shadow-primary/5"
                  : "hover:bg-muted/80"
              )}
            />
          </div>
        </form>

        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
          >
            {mobileSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-accent/50">
            <Link to="/messages">
              <MessageSquare className="h-5 w-5" />
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-in zoom-in-50">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </Link>
          </Button>

          <Button variant="ghost" size="icon" asChild className="relative transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-accent/50">
            <Link to="/notifications">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center animate-in zoom-in-50">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
          </Button>

          {(user?.is_provider || user?.is_seller) && (
            <Button
              variant="default"
              size="sm"
              className="hidden sm:flex gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-95"
              asChild
            >
              <Link to="/listings/new">
                <PlusCircle className="h-4 w-4" />
                New Listing
              </Link>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full ml-1 transition-all duration-200 hover:scale-110 active:scale-95">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/40">
                  <AvatarImage src={user?.profile_photo_url || undefined} />
                  <AvatarFallback className="text-xs font-semibold">{initials || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={user?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-sm font-semibold">{initials || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile/me")} className="cursor-pointer py-2.5">
                <User className="h-4 w-4 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm">My Profile</p>
                  <p className="text-xs text-muted-foreground">Manage your account</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/my-listings")} className="cursor-pointer py-2.5">
                <List className="h-4 w-4 mr-3 text-muted-foreground" />
                <div>
                  <p className="text-sm">My Listings</p>
                  <p className="text-xs text-muted-foreground">View and manage listings</p>
                </div>
              </DropdownMenuItem>
              {user?.is_admin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/admin-dashboard")} className="cursor-pointer py-2.5">
                    <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
                    <div>
                      <p className="text-sm">Admin Dashboard</p>
                      <p className="text-xs text-muted-foreground">Platform management</p>
                    </div>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer py-2.5 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-3" />
                <div>
                  <p className="text-sm">Log Out</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services & products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
