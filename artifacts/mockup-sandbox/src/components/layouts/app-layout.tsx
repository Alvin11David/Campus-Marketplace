import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/shared/navbar";
import { BottomTabBar } from "@/components/shared/bottom-tab-bar";
import { PageTransition } from "@/components/shared/page-transition";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      <Navbar />
      <main className="relative">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <BottomTabBar />
    </div>
  );
}
