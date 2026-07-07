import { useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwipeAction {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  className?: string;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  className?: string;
  onTap?: () => void;
}

const ACTION_WIDTH = 72;

export function SwipeableRow({ children, actions, className, onTap }: SwipeableRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const draggedRef = useRef(false);
  const totalWidth = actions.length * ACTION_WIDTH;

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -30) {
      draggedRef.current = true;
      if (info.offset.x < -totalWidth / 3) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    } else if (info.offset.x > 30) {
      draggedRef.current = true;
      setIsOpen(false);
    } else {
      setTimeout(() => { draggedRef.current = false; }, 100);
    }
  };

  const handleClick = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    onTap?.();
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Background action buttons */}
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
              setIsOpen(false);
            }}
            className={cn(
              "flex flex-col items-center justify-center w-[72px] gap-0.5 text-white text-[10px] font-medium transition-colors active:scale-95",
              action.className || "bg-muted-foreground/60",
            )}
            style={{ borderRadius: i === actions.length - 1 ? "0 0.75rem 0.75rem 0" : undefined }}
          >
            <action.icon className="h-4 w-4" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Swipeable foreground */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -totalWidth, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        animate={{ x: isOpen ? -totalWidth : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="relative bg-background cursor-pointer"
        onClick={handleClick}
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
