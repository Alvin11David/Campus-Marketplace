import { motion } from "framer-motion";
import { PackageOpen, SearchX, Inbox, AlertCircle, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const iconMap: Record<string, LucideIcon> = {
  package: PackageOpen,
  search: SearchX,
  inbox: Inbox,
  alert: AlertCircle,
};

interface EmptyStateProps {
  icon?: "package" | "search" | "inbox" | "alert";
  title: string;
  description: string;
  action?: {
    label: string;
    to: string;
  };
}

export function EmptyState({ icon = "package", title, description, action }: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <Icon className="w-12 h-12 text-primary/40" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-secondary/50" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <Button asChild>
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </motion.div>
  );
}
