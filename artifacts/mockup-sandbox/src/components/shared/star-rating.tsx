import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number | null;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const sizeMap = { sm: 12, md: 16, lg: 20 };

export function StarRating({
  rating,
  maxRating = 5,
  size = "sm",
  showValue = false,
  interactive = false,
  onRate,
}: StarRatingProps) {
  const starSize = sizeMap[size];
  const numericRating = rating ?? 0;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const filled = numericRating >= starIndex;
          const halfFilled = !filled && numericRating >= starIndex - 0.5;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRate?.(starIndex)}
              className={cn(
                "transition-colors",
                interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
              )}
            >
              {halfFilled ? (
                <StarHalf
                  className={cn("fill-amber-400 text-amber-400")}
                  style={{ width: starSize, height: starSize }}
                />
              ) : (
                <Star
                  className={cn(
                    filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  )}
                  style={{ width: starSize, height: starSize }}
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && rating != null && (
        <span className="text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
