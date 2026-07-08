import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";

interface GitHubStarsWheelProps {
  username?: string;
  repo?: string;
  delay?: number;
  value?: number;
  direction?: "btt" | "ttb";
  step?: number;
  itemsSize?: number;
  sideItemsCount?: number;
  onNumberChange?: (value: number) => void;
  inView?: boolean;
  inViewOnce?: boolean;
  inViewMargin?: string;
  className?: string;
}

export function GitHubStarsWheel({
  username = "Alvin11David",
  repo = "Campus-Marketplace",
  delay = 0,
  value = 0,
  direction = "btt",
  step = 100,
  itemsSize = 35,
  sideItemsCount = 2,
  onNumberChange,
  inView = false,
  inViewOnce = true,
  inViewMargin = "0px",
  className = "",
}: GitHubStarsWheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: inViewOnce, margin: inViewMargin as any });
  const controls = useAnimation();
  const [currentValue, setCurrentValue] = useState(0);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    // Fetch GitHub stars
    const fetchStars = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}`);
        if (response.ok) {
          const data = await response.json();
          setStars(data.stargazers_count);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stars:", error);
      }
    };

    fetchStars();
  }, [username, repo]);

  useEffect(() => {
    if (inView && isInView) {
      controls.start("visible");
    }
  }, [isInView, inView, controls]);

  useEffect(() => {
    if (stars !== null && isInView) {
      const duration = 2000;
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const newValue = Math.floor(easeProgress * stars);
        setCurrentValue(newValue);
        onNumberChange?.(newValue);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      setTimeout(() => animate(), delay);
    }
  }, [stars, isInView, delay, onNumberChange]);

  const generateWheelItems = () => {
    const items: number[] = [];
    const max = stars || value || 100;
    for (let i = 0; i <= sideItemsCount * 2 + 1; i++) {
      const offset = i - sideItemsCount;
      items.push(Math.max(0, max + offset * step));
    }
    return items;
  };

  const items = generateWheelItems();
  const displayValue = stars !== null ? currentValue : value;

  return (
    <div ref={ref} className={`flex items-center gap-3 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, delay }}
        className="flex items-center gap-2"
      >
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        <div className="relative overflow-hidden" style={{ height: `${itemsSize}px` }}>
          <motion.div
            initial={{ y: direction === "btt" ? "100%" : "-100%" }}
            animate={isInView ? { y: "0%" } : { y: direction === "btt" ? "100%" : "-100%" }}
            transition={{ duration: 1.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col"
            style={{ fontSize: `${itemsSize}px`, lineHeight: `${itemsSize}px` }}
          >
            {items.map((item, index) => (
              <motion.div
                key={index}
                className="font-bold text-foreground"
                style={{
                  opacity: index === sideItemsCount ? 1 : 0.3,
                  scale: index === sideItemsCount ? 1 : 0.8,
                }}
              >
                {item}
              </motion.div>
            ))}
          </motion.div>
        </div>
        <span className="text-sm text-muted-foreground">stars</span>
      </motion.div>
    </div>
  );
}
