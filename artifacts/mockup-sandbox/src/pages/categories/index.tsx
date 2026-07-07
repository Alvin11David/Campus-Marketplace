import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Printer, Wrench, BookOpen, Scissors, Sparkles, Package } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import { CATEGORY_ICONS } from "@/lib/api";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Printer, Wrench, BookOpen,
  Scissors, Sparkles, Package,
};

const gradients = [
  "from-purple-500/10 to-pink-500/10",
  "from-blue-500/10 to-cyan-500/10",
  "from-green-500/10 to-emerald-500/10",
  "from-yellow-500/10 to-orange-500/10",
  "from-indigo-500/10 to-purple-500/10",
  "from-rose-500/10 to-pink-500/10",
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 3xl:max-w-[1600px] 4xl:max-w-[1920px]">
        <div className="flex items-start gap-3 mb-8">
          <BackButton className="-ml-1 mt-1" />
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <h1 className="text-3xl font-bold tracking-tight">Browse Categories</h1>
            <p className="mt-2 text-muted-foreground">
              Find services and products offered by fellow students
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5"
        >
          {MOCK_CATEGORIES.map((category, i) => {
            const iconName = CATEGORY_ICONS[category.name] || "Package";
            const Icon = iconMap[iconName] || Package;

            return (
              <motion.div key={category.id} variants={item}>
                <Link to={`/categories/${category.slug}`} className="block h-full">
                  <Card className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 border-primary/5 group cursor-pointer overflow-hidden">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div
                        className={cn(
                          "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                          gradients[i % gradients.length]
                        )}
                      >
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{category.name}</h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-3 bg-secondary/10">
                        {category.active_listing_count} listing{category.active_listing_count !== 1 ? "s" : ""}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
