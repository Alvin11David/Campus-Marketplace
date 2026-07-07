import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, Search, MessageSquare, Handshake, Printer, Wrench, BookOpen, Scissors, Sparkles, Package, Star, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import type { Category } from "@/lib/api";

const categoryIconMap: Record<string, typeof Printer> = {
  Printer, Wrench, BookOpen, Scissors, Sparkles, Package,
};

function CategoryTeaserCard({ category }: { category: Category }) {
  const IconComponent = categoryIconMap[category.icon_name] || Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-primary/5">
        <Link to={`/categories/${category.slug}`}>
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/25">
              <IconComponent className="h-7 w-7" />
            </div>
            <span className="text-sm font-semibold text-center leading-tight">{category.name}</span>
            <span className="text-xs text-muted-foreground text-center line-clamp-1">{category.description}</span>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-primary/5 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
              <span className="text-sm font-bold text-primary-foreground">CM</span>
            </div>
            <span className="text-lg font-bold">CampusMarket</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/25" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24 lg:pb-36 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary"
            >
              <Sparkles className="h-4 w-4" />
              Your campus community marketplace
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Your Campus</span> Marketplace
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg md:mt-6 max-w-lg mx-auto">
              Discover services and products offered by fellow students at Victoria University
            </p>

            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 500+ Students</span>
              <span className="flex items-center gap-1"><ShoppingBag className="h-4 w-4" /> 50+ Listings</span>
              <span className="flex items-center gap-1"><Star className="h-4 w-4" /> 4.8 Avg Rating</span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center md:mt-10">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-95" asChild>
                <Link to="/register">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 active:scale-95 transition-transform" asChild>
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  Log In
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-primary/5 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl font-bold md:text-3xl">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to get what you need on campus</p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Search,
                title: "Browse Listings",
                description: "Explore services and products offered by fellow students in your campus community.",
              },
              {
                step: "02",
                icon: MessageSquare,
                title: "Message Providers",
                description: "Chat directly with listing owners to ask questions and arrange details.",
              },
              {
                step: "03",
                icon: Handshake,
                title: "Meet & Transact",
                description: "Agree on a time and place to meet on campus and complete the transaction.",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                >
                  <Card className="h-full text-center border-primary/5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <CardContent className="flex flex-col items-center gap-4 p-8">
                      <span className="text-sm font-bold text-muted-foreground/40">{item.step}</span>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl font-bold md:text-3xl">Browse by Category</h2>
          <p className="mt-2 text-muted-foreground">Find exactly what you need from students around campus</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {MOCK_CATEGORIES.map((category) => (
            <CategoryTeaserCard key={category.id} category={category} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Button variant="outline" size="lg" className="active:scale-95 transition-transform" asChild>
            <Link to="/categories">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-primary/5 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {[
              { value: "500+", label: "Active Students" },
              { value: "50+", label: "Listings" },
              { value: "4.8", label: "Average Rating" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/5">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/25">
                <span className="text-[10px] font-bold text-primary-foreground">CM</span>
              </div>
              <span className="text-sm font-semibold">CampusMarket</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Campus Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
