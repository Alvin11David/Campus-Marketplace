import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { ArrowRight, LogIn, Search, MessageSquare, Handshake, Printer, Wrench, BookOpen, Scissors, Sparkles, Package, Star, Users, ShoppingBag, Zap, TrendingUp, Shield, Heart, ChevronRight, Globe, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { apiGet, mapCategory } from "@/lib/api";
import type { Category } from "@/lib/api";
import { useEffect, useState, useRef } from "react";
import { GitHubStarsWheel } from "@/components/shared/github-stars-wheel";

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
      <Card className="group cursor-pointer transition-all duration-500 hover:shadow-xl hover:shadow-indigo-500/25 border-2 border-indigo-500/20 bg-white hover:border-indigo-500/40 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Link to={`/categories/${category.slug}`} className="relative">
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <motion.div 
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-amber-500/10 text-indigo-600 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-amber-500 group-hover:text-white group-hover:shadow-xl group-hover:shadow-indigo-500/30"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <IconComponent className="h-8 w-8" />
            </motion.div>
            <span className="text-sm font-semibold text-center leading-tight group-hover:text-indigo-600 transition-colors">{category.name}</span>
            <span className="text-xs text-muted-foreground text-center line-clamp-1">{category.description}</span>
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

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    apiGet<any[]>("/categories")
      .then((data) => setCategories((data ?? []).map(mapCategory)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div style={{ y: y1 }} className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent rounded-full blur-[150px]" />
        <motion.div style={{ y: y2 }} className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent rounded-full blur-[120px]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[30%] w-[30%] h-[30%] bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-[100px]" 
        />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <FloatingElement key={i} delay={i * 0.5} duration={15 + i * 2}>
              <div 
                className={`absolute w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-indigo-500/20' : i % 3 === 1 ? 'bg-amber-500/20' : 'bg-orange-500/20'}`}
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
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-amber-500 shadow-lg shadow-indigo-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-sm font-bold text-primary-foreground">CM</span>
              </motion.div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">CampusMarket</span>
            </Link>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" className="relative overflow-hidden group text-xs sm:text-sm" asChild>
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
                className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-amber-500 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all text-xs sm:text-sm" 
                asChild
              >
                <Link to="/register">
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <Zap className="h-3 w-3" />
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-indigo-600"
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
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 via-background to-amber-500/8" />
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
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-gradient-to-r from-indigo-500/20 to-amber-500/20 px-6 py-2 text-sm text-indigo-600 backdrop-blur-sm shadow-lg shadow-indigo-500/20"
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
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-400 bg-clip-text text-transparent animate-gradient">Your Campus</span>{" "}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Marketplace</span>
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
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <motion.div
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/25 shadow-sm shadow-primary/5"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">500+ Students</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-amber-500/10 backdrop-blur-sm border border-amber-500/25 shadow-sm shadow-amber-500/5"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ShoppingBag className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600">50+ Listings</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-orange-500/10 backdrop-blur-sm border border-orange-500/25 shadow-sm shadow-orange-500/5"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Star className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-semibold text-orange-600">4.8 Avg Rating</span>
              </motion.div>
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
                  className="w-full sm:w-auto gap-2 bg-gradient-to-r from-indigo-600 to-amber-500 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all relative overflow-hidden group text-sm sm:text-base"
                  asChild
                >
                  <Link to="/register">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-500 to-indigo-600"
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
                  className="w-full sm:w-auto gap-2 border-2 border-indigo-500/30 hover:border-indigo-500/50 transition-all bg-indigo-500/5 text-sm sm:text-base"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-600"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(79, 70, 229, 0.2)" }}
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
      <section className="border-t border-amber-200/60 bg-amber-50/70">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28 xl:max-w-none xl:px-10 2xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <motion.h2 
              className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              How It Works
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Three simple steps to get what you need on campus
            </motion.p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 4xl:grid-cols-3">
            {[
              {
                step: "01",
                icon: Search,
                title: "Browse Listings",
                description: "Explore services and products offered by fellow students in your campus community.",
                gradient: "from-indigo-500/30 to-indigo-500/10",
              },
              {
                step: "02",
                icon: MessageSquare,
                title: "Message Providers",
                description: "Chat directly with listing owners to ask questions and arrange details.",
                gradient: "from-amber-500/30 to-amber-500/10",
              },
              {
                step: "03",
                icon: Handshake,
                title: "Meet & Transact",
                description: "Agree on a time and place to meet on campus and complete the transaction.",
                gradient: "from-emerald-500/30 to-emerald-500/10",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <Card className="h-full text-center border-2 border-amber-500/20 bg-white transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/25 hover:border-amber-500/40 overflow-hidden relative group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <CardContent className="relative flex flex-col items-center gap-6 p-8">
                      <motion.div 
                        className="relative"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-amber-500/20 rounded-full blur-xl" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 border border-indigo-500/30">
                          <Icon className="h-10 w-10 text-indigo-600" />
                        </div>
                      </motion.div>
              <span className="text-2xl font-bold text-muted-foreground/30">{item.step}</span>
              <h3 className="text-xl font-semibold group-hover:text-indigo-600 transition-colors">{item.title}</h3>
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
      <section className="border-t border-indigo-200/60 bg-indigo-50/70">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28 xl:max-w-none xl:px-10 2xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.h2 
              className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Browse by Category
          </motion.h2>
          <motion.p 
            className="mt-4 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Find exactly what you need from students around campus
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 3xl:grid-cols-8 4xl:grid-cols-10">
          {categories.map((category, index) => (
            <CategoryTeaserCard key={category.id} category={category} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                  variant="outline" 
                  size="lg" 
                  className="px-8 py-6 text-lg border-2 border-indigo-500/30 hover:border-indigo-600/50 transition-all bg-white hover:bg-indigo-500/5 group relative overflow-hidden"
                  asChild
            >
              <Link to="/categories">
                <span className="relative z-10 flex items-center gap-2">
                  View All Categories
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-amber-500/20"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-amber-200/60 bg-amber-50/70 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" 
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28 xl:max-w-none xl:px-10 2xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <motion.h2 
              className="text-4xl font-bold md:text-5xl bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Our Impact
            </motion.h2>
            <motion.p 
              className="mt-4 text-lg text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Building a thriving campus community
            </motion.p>
          </motion.div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 4xl:grid-cols-3">
            {[
              { value: 500, label: "Active Students", icon: Users, color: "from-indigo-600 to-indigo-400" },
              { value: 50, label: "Listings", icon: ShoppingBag, color: "from-amber-500 to-amber-400" },
              { value: 4.8, label: "Average Rating", icon: Star, color: "from-emerald-500 to-emerald-400" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="text-center"
              >
                <Card className="border-2 border-indigo-500/20 bg-white hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="relative p-8">
                    <motion.div 
                      className="flex justify-center mb-4"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-amber-500/20 border border-indigo-500/30">
                        <stat.icon className="h-8 w-8 text-indigo-600" />
                      </div>
                    </motion.div>
                    <div className={`text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                      {stat.value % 1 !== 0 ? stat.value : <AnimatedCounter end={stat.value} />}
                      {stat.value % 1 !== 0 ? "" : "+"}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-indigo-200/60 bg-indigo-50/50"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 xl:max-w-none xl:px-10 2xl:px-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="flex items-center gap-2"
            >
              <motion.div 
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-amber-500 shadow-lg shadow-indigo-500/30"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-[10px] font-bold text-primary-foreground">CM</span>
              </motion.div>
              <span className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-amber-500 bg-clip-text text-transparent">CampusMarket</span>
            </motion.div>
            <motion.p 
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              &copy; 2026 Campus Marketplace. All rights reserved.
            </motion.p>
            <div className="flex items-center gap-4">
              <GitHubStarsWheel inView inViewOnce={false} inViewMargin="-100px" className="text-lg" />
              {[Shield, Heart, Globe].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                >
                  <Icon className="h-4 w-4 text-indigo-500/80" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
