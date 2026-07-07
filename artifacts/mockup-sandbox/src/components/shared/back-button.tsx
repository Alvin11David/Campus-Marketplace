import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  className?: string;
  showLabel?: boolean;
  variant?: "ghost" | "outline";
}

export function BackButton({
  fallback = "/dashboard",
  label = "Back",
  className,
  showLabel = true,
  variant = "ghost",
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Button
        variant={variant}
        size="sm"
        onClick={handleBack}
        aria-label={showLabel ? undefined : label}
        className={cn(
          "group gap-1 -ml-1.5 text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-200",
          className,
        )}
      >
        <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {showLabel && <span className="text-sm">{label}</span>}
      </Button>
    </motion.div>
  );
}
