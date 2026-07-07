import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, LogIn, Search, MessageSquare, Handshake, Printer, Wrench, BookOpen, Scissors, Sparkles, Package, Star, Users, ShoppingBag, Zap, TrendingUp, Shield, Heart, ChevronRight, Globe, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import type { Category } from "@/lib/api";
import { useEffect, useState, useRef } from "react";

const categoryIconMap: Record<string, typeof Printer> = {
  Printer, Wrench, BookOpen, Scissors, Sparkles, Package,
};

function FloatingElement({ children, delay, duration = 20 }: { children: React.ReactNode; delay: number; duration?: number }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
}

function useInView(ref: any, options: any) {
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  return isInView;
}

function CategoryTeaserCard({ category, index }: { category: Category; index: number }) {
  const IconComponent = categoryIconMap[category.icon_name] || Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Card className="group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 border-primary/10 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Link to={`/categories/${category.slug}`} className="relative">
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <motion.div 
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <IconComponent className="h-8 w-8" />
            </motion.div>
            <span className="text-sm font-semibold text-center leading-tight group-hover:text-primary transition-colors">{category.name}</span>
            <span className="text-xs text-muted-foreground text-center line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">{category.description}</span>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}

export default function Landing() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-[150px]" />
        <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent rounded-full blur-[120px]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-[100px]" 
        />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <FloatingElement key={i} delay={i * 0.5} duration={15 + i * 2}>
            <div 
              className="absolute w-2 h-2 rounded-full bg-primary/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          </FloatingElement>
        ))}
      </div>

      {/* Enhanced Nav */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="sticky top-0 z-50 border-b border-primary/5 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8 xl:max-w-none xl:px-10 2xl:px-12">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Link to="/" className="flex items-center gap-2">
              <motion.div 
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-sm font-bold text-primary-foreground">CM</span>
              </motion.div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CampusMarket</span>
            </Link>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="relative overflow-hidden group" asChild>
                <Link to="/login">
                  <span className="relative z-10">Log In</span>
                  <motion.div 
                    className="absolute inset-0 bg-primary/10"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all" 
                asChild
              >
                <Link to="/register">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <Zap className="h-3 w-3" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-secondary to-primary"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-secondary/8" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 md:px-6 md:pb-28 md:pt-24 lg:pb-36 lg:pt-32 xl:max-w-none xl:px-10 2xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-2 text-sm text-primary backdrop-blur-sm shadow-lg shadow-primary/10"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-4 w-4" />
              </motion.div>
              <span className="font-medium">Your campus community marketplace</span>
            </motion.div>
            <motion.h1 
              className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent animate-gradient bg-300% bg-gradient-to-r">Your Campus</span>{" "}
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Marketplace</span>
            </motion.h1>
            <motion.p 
              className="mt-6 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover services and products offered by fellow students at Victoria University
            </motion.p>

            <motion.div 
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {[
                { icon: Users, label: "500+ Students", color: "text-primary" },
                { icon: ShoppingBag, label: "50+ Listings", color: "text-secondary" },
                { icon: Star, label: "4.8 Avg Rating", color: "text-accent" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 backdrop-blur-sm border border-primary/10"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="font-medium">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 transition-all text-lg px-8 py-6 relative overflow-hidden group"
                  asChild
                >
                  <Link to="/register">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-secondary to-primary"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto gap-2 text-lg px-8 py-6 border-2 border-primary/20 hover:border-primary/40 transition-all bg-background/50 backdrop-blur-sm"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-5 w-5" />
                    Log In
                  </Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Feature Pills */}
            <motion.div 
              className="mt-12 flex flex-wrap items-center justify-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { icon: Shield, label: "Secure" },
                { icon: Heart, label: "Trusted" },
                { icon: Zap, label: "Fast" },
                { icon: Globe, label: "Local" },
              ].map((feature, i) => (
                <motion.div
                  key={feature.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary/70"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(30, 58, 138, 0.1)" }}
                >
                  <feature.icon className="h-3 w-3" />
                  {feature.label}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-primary/5 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 xl:max-w-none xl:px-10 2xl:px-12">
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

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 4xl:grid-cols-3">
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
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 xl:max-w-none xl:px-10 2xl:px-12">
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

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
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
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24 xl:max-w-none xl:px-10 2xl:px-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 4xl:grid-cols-3">
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
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 xl:max-w-none xl:px-10 2xl:px-12">
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
