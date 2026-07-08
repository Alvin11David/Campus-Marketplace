import { Outlet, Link, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/shared/page-transition";
import { StarsBackground } from "@/components/backgrounds/stars-background";

export function AuthLayout() {
  const location = useLocation();

  return (
    <StarsBackground className="min-h-screen flex flex-col">

      <header className="relative z-10 p-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="h-8 w-8 rounded-lg bg-primary shadow-lg shadow-primary/25 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">CM</span>
          </div>
          <span className="font-bold text-lg text-foreground dark:text-white">CampusMarket</span>
        </Link>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto min-h-0">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 p-4 text-center text-xs text-muted-foreground/70 dark:text-muted-foreground">
        &copy; 2026 Campus Marketplace. All rights reserved.
      </footer>
    </StarsBackground>
  );
}
