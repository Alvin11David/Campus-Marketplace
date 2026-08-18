import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React, { type ReactNode } from "react";

type EmptyVariant =
  | "explorer"
  | "mailbox"
  | "bell"
  | "package"
  | "shelf"
  | "star"
  | "report"
  | "activity"
  | "general"
  | "message"
  | "search"
  | "listing";

interface CartoonEmptyProps {
  variant?: EmptyVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

const floating = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const slowSpin = {
  animate: {
    rotate: [0, 10, 0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const bounce = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const pulse = {
  animate: {
    scale: [1, 1.08, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const },
  },
};

function ExplorerSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Body */}
      <motion.circle cx="60" cy="50" r="24" fill="hsl(var(--primary) / 0.12)" {...bounce} />
      {/* Face */}
      <circle cx="60" cy="48" r="18" fill="hsl(var(--primary))" />
      {/* Eyes */}
      <motion.g
        animate={{ scaleY: [1, 0.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2], ease: "easeInOut" as const }}
      >
        <circle cx="53" cy="44" r="2.5" fill="white" />
        <circle cx="67" cy="44" r="2.5" fill="white" />
      </motion.g>
      <circle cx="53" cy="44" r="1.2" fill="#1a1a2e" />
      <circle cx="67" cy="44" r="1.2" fill="#1a1a2e" />
      {/* Smile */}
      <path d="M53 54 Q60 60 67 54" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body */}
      <rect x="48" y="64" width="24" height="22" rx="6" fill="hsl(var(--primary) / 0.15)" />
      {/* Legs */}
      <rect x="50" y="84" width="7" height="10" rx="3" fill="hsl(var(--primary) / 0.1)" />
      <rect x="63" y="84" width="7" height="10" rx="3" fill="hsl(var(--primary) / 0.1)" />
      {/* Magnifying glass */}
      <motion.g {...slowSpin} style={{ originX: 95, originY: 30 }}>
        <circle cx="95" cy="25" r="10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity={0.5} />
        <line x1="102" y1="33" x2="108" y2="40" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" opacity={0.5} />
      </motion.g>
    </svg>
  );
}

function PackageSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Floating box */}
      <motion.g {...floating}>
        <rect x="35" y="35" width="50" height="48" rx="8" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
        {/* Lid */}
        <rect x="30" y="28" width="60" height="10" rx="4" fill="hsl(var(--primary) / 0.2)" />
        {/* Tape */}
        <rect x="55" y="28" width="10" height="55" rx="1" fill="hsl(var(--primary) / 0.08)" />
        {/* Question marks */}
        <motion.text x="60" y="67" textAnchor="middle" fill="hsl(var(--primary))" fontSize="18" fontWeight="700" {...pulse}>?</motion.text>
      </motion.g>
      {/* Decorative dots */}
      <motion.circle cx="25" cy="25" r="3" fill="hsl(var(--primary) / 0.2)" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }} />
      <motion.circle cx="95" cy="85" r="2" fill="hsl(var(--secondary) / 0.2)" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.6 }} />
      <motion.circle cx="20" cy="90" r="2.5" fill="hsl(var(--primary) / 0.15)" animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.9 }} />
    </svg>
  );
}

function MailboxSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Mailbox body */}
      <motion.g {...floating}>
        <rect x="30" y="45" width="50" height="38" rx="6" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
        <path d="M30 45 Q55 30 80 45" fill="hsl(var(--primary) / 0.12)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
        {/* Slot */}
        <rect x="45" y="50" width="20" height="4" rx="2" fill="hsl(var(--primary) / 0.3)" />
        {/* Post */}
        <rect x="75" y="60" width="5" height="35" rx="2" fill="hsl(var(--primary) / 0.15)" />
        {/* Flag */}
        <motion.g {...slowSpin} style={{ originX: 82, originY: 55 }}>
          <rect x="80" y="42" width="3" height="16" rx="1" fill="hsl(var(--primary) / 0.4)" />
          <rect x="83" y="42" width="10" height="6" rx="2" fill="hsl(var(--primary) / 0.5)" />
        </motion.g>
      </motion.g>
      {/* Floating letter */}
      <motion.g animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1 }}>
        <rect x="48" y="28" width="14" height="10" rx="1" fill="hsl(var(--primary))" />
        <path d="M48 28 L55 34 L62 28" stroke="white" strokeWidth="1" fill="none" />
      </motion.g>
    </svg>
  );
}

function BellSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <motion.g {...bounce}>
        {/* Bell */}
        <path d="M60 25 Q45 25 42 45 L38 60 Q35 70 28 72 L92 72 Q85 70 82 60 L78 45 Q75 25 60 25" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
        {/* Bell bottom */}
        <rect x="50" y="72" width="20" height="5" rx="2" fill="hsl(var(--primary) / 0.2)" />
        {/* Clapper */}
        <circle cx="60" cy="78" r="4" fill="hsl(var(--primary) / 0.3)" />
        {/* Sound waves */}
        <motion.path d="M80 40 Q90 50 80 60" stroke="hsl(var(--primary) / 0.2)" strokeWidth="1.5" fill="none" strokeLinecap="round" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.path d="M88 35 Q100 50 88 65" stroke="hsl(var(--secondary) / 0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} />
      </motion.g>
      {/* Zzz */}
      <motion.text x="22" y="35" fill="hsl(var(--muted-foreground))" fontSize="10" fontWeight="600" opacity={0.4} animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }}>zzz</motion.text>
    </svg>
  );
}

function StarSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <motion.g {...pulse}>
        {/* Star */}
        <path d="M60 20 L68 45 L95 45 L73 62 L80 88 L60 72 L40 88 L47 62 L25 45 L52 45 Z" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
        {/* Sparkles */}
      </motion.g>
      <motion.circle cx="85" cy="30" r="2.5" fill="hsl(var(--primary) / 0.4)" animate={{ scale: [0, 1.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      <motion.circle cx="30" cy="75" r="2" fill="hsl(var(--secondary) / 0.3)" animate={{ scale: [0, 1.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} />
      <motion.circle cx="95" cy="70" r="1.5" fill="hsl(var(--primary) / 0.3)" animate={{ scale: [0, 1.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }} />
    </svg>
  );
}

function ActivitySVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Timeline */}
      <motion.g {...floating}>
        {/* Line */}
        <line x1="40" y1="20" x2="40" y2="100" stroke="hsl(var(--primary) / 0.2)" strokeWidth="2" strokeDasharray="4 4" />
        {/* Dots */}
        <circle cx="40" cy="30" r="4" fill="hsl(var(--primary) / 0.3)" />
        <circle cx="40" cy="55" r="4" fill="hsl(var(--primary) / 0.2)" />
        <circle cx="40" cy="80" r="4" fill="hsl(var(--primary) / 0.15)" />
        {/* Card outlines */}
        <rect x="52" y="24" width="40" height="12" rx="4" fill="hsl(var(--primary) / 0.08)" />
        <rect x="52" y="49" width="35" height="12" rx="4" fill="hsl(var(--primary) / 0.06)" />
        <rect x="52" y="74" width="45" height="12" rx="4" fill="hsl(var(--primary) / 0.04)" />
      </motion.g>
      {/* Sparkle */}
      <motion.circle cx="90" cy="22" r="2" fill="hsl(var(--primary) / 0.3)" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
    </svg>
  );
}

function ShieldSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <motion.g {...bounce}>
        {/* Shield */}
        <path d="M60 15 L90 30 L90 55 Q90 80 60 95 Q30 80 30 55 L30 30 Z" fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1.5" />
        {/* Check */}
        <motion.path d="M45 55 L55 65 L75 45" stroke="hsl(var(--primary) / 0.5)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" animate={{ pathLength: [0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      </motion.g>
    </svg>
  );
}

function GeneralSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Face */}
      <motion.circle cx="60" cy="50" r="22" fill="hsl(var(--muted-foreground) / 0.08)" {...bounce} />
      <circle cx="60" cy="48" r="16" fill="hsl(var(--muted-foreground) / 0.12)" />
      {/* Eyes */}
      <motion.g animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2], ease: "easeInOut" as const }}>
        <circle cx="53" cy="45" r="2" fill="hsl(var(--muted-foreground))" />
        <circle cx="67" cy="45" r="2" fill="hsl(var(--muted-foreground))" />
      </motion.g>
      {/* Neutral mouth */}
      <path d="M54 55 Q60 58 66 55" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Arms raised */}
      <motion.g animate={{ rotate: [0, -5, 0, 5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
        <line x1="44" y1="55" x2="30" y2="40" stroke="hsl(var(--muted-foreground) / 0.15)" strokeWidth="3" strokeLinecap="round" />
        <line x1="76" y1="55" x2="90" y2="40" stroke="hsl(var(--muted-foreground) / 0.15)" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

function MessageSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <motion.g {...floating}>
        {/* Bubble */}
        <rect x="25" y="30" width="60" height="45" rx="12" fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1.5" />
        {/* Tail */}
        <path d="M55 75 L65 65 L75 75" fill="hsl(var(--primary) / 0.08)" stroke="hsl(var(--primary) / 0.25)" strokeWidth="1.5" />
        {/* Dots */}
        <circle cx="45" cy="52" r="2.5" fill="hsl(var(--primary) / 0.2)" />
        <circle cx="55" cy="52" r="2.5" fill="hsl(var(--primary) / 0.3)" />
        <circle cx="65" cy="52" r="2.5" fill="hsl(var(--primary))" />
      </motion.g>
    </svg>
  );
}

function SearchSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Ground */}
      <motion.ellipse cx="60" cy="95" rx="35" ry="6" fill="hsl(var(--primary) / 0.05)" {...floating} />
      {/* Character */}
      <motion.g {...bounce}>
        <circle cx="60" cy="48" r="16" fill="hsl(var(--primary) / 0.1)" />
        <circle cx="60" cy="46" r="12" fill="hsl(var(--primary) / 0.15)" />
        {/* Eyes looking right */}
        <circle cx="56" cy="43" r="1.5" fill="#1a1a2e" />
        <circle cx="66" cy="43" r="1.5" fill="#1a1a2e" />
        <circle cx="56" cy="43" r="0.5" fill="#1a1a2e" />
        {/* Smile */}
        <path d="M55 50 Q60 54 65 50" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Magnifying glass */}
        <circle cx="85" cy="28" r="10" fill="none" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" />
        <line x1="92" y1="36" x2="98" y2="43" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
      {/* Exclamation */}
      <motion.text x="22" y="40" fill="hsl(var(--muted-foreground) / 0.3)" fontSize="14" fontWeight="700" animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>!</motion.text>
    </svg>
  );
}

function ShelfSVG() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      {/* Shelf */}
      <motion.g {...floating}>
        <rect x="20" y="55" width="80" height="5" rx="2" fill="hsl(var(--primary) / 0.15)" />
        <rect x="20" y="80" width="80" height="5" rx="2" fill="hsl(var(--primary) / 0.1)" />
        {/* Vertical supports */}
        <rect x="20" y="50" width="4" height="40" rx="1" fill="hsl(var(--primary) / 0.08)" />
        <rect x="96" y="50" width="4" height="40" rx="1" fill="hsl(var(--primary) / 0.08)" />
        {/* Dust */}
        <motion.circle cx="40" cy="50" r="2" fill="hsl(var(--muted-foreground) / 0.1)" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
        <motion.circle cx="70" cy="75" r="1.5" fill="hsl(var(--muted-foreground) / 0.08)" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} />
      </motion.g>
      {/* Spider web */}
      <motion.path d="M90 20 Q85 30 90 40" stroke="hsl(var(--muted-foreground) / 0.08)" strokeWidth="1" fill="none" animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity }} />
    </svg>
  );
}

const illustrations: Record<EmptyVariant, () => React.JSX.Element> = {
  explorer: ExplorerSVG,
  mailbox: MailboxSVG,
  bell: BellSVG,
  package: PackageSVG,
  shelf: ShelfSVG,
  star: StarSVG,
  report: ShieldSVG,
  activity: ActivitySVG,
  general: GeneralSVG,
  message: MessageSVG,
  search: SearchSVG,
  listing: PackageSVG,
};

export function CartoonEmpty({ variant = "general", title, description, action, className }: CartoonEmptyProps) {
  const Illustration = illustrations[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("flex flex-col items-center justify-center py-12 px-6 text-center", className)}
    >
      <div className="w-28 h-28 mb-5">
        <Illustration />
      </div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="text-base font-semibold text-foreground mb-1"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="text-sm text-muted-foreground max-w-xs"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.3 }}
          className="mt-4"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
