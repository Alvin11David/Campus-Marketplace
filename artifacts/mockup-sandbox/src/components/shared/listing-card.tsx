import { Link } from "react-router-dom";
import { MapPin, MessageSquare, Eye, Wrench, Package, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./star-rating";
import type { Listing } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  listing: Listing;
  showStats?: boolean;
  className?: string;
  featured?: boolean;
}

const gradients = [
  "from-purple-400/20 to-pink-400/20",
  "from-blue-400/20 to-cyan-400/20",
  "from-green-400/20 to-emerald-400/20",
  "from-yellow-400/20 to-orange-400/20",
  "from-indigo-400/20 to-purple-400/20",
];

export function ListingCard({ listing, showStats = false, className, featured }: ListingCardProps) {
  const ownerInitials = listing.owner.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const gradientIndex = String(listing.id)
    .split("")
    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);

  return (
    <Link to={`/listings/${listing.id}`}>
      <Card
        className={cn(
          "overflow-hidden transition-all duration-300 group cursor-pointer",
          "hover:shadow-xl hover:-translate-y-0.5",
          featured && "ring-2 ring-primary/20",
          className
        )}
      >
        <div className="aspect-[16/9] bg-muted relative overflow-hidden">
          {listing.primary_image_url ? (
            <img
              src={listing.primary_image_url}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div
              className={cn(
                "h-full w-full bg-gradient-to-br flex items-center justify-center",
                gradients[gradientIndex % gradients.length]
              )}
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  {listing.listing_type === "service" ? (
                    <Wrench className="w-8 h-8 text-muted-foreground/60" />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground/60" />
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
          {listing.status !== "active" && (
            <div className="absolute top-2 right-2">
              <Badge variant={listing.status === "paused" ? "secondary" : "destructive"}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </Badge>
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm border-0"
            >
              {listing.listing_type === "service" ? "Service" : "Product"}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm leading-tight mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-300">
            {listing.title}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 font-normal text-muted-foreground"
            >
              {listing.category.name}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{listing.campus_location.name}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-5 w-5 ring-1 ring-border">
              <AvatarImage src={listing.owner.profile_photo_url || undefined} />
              <AvatarFallback className="text-[8px]">{ownerInitials}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate flex items-center gap-0.5">
              {listing.owner.full_name}
              {listing.owner.is_verified && (
                <BadgeCheck className="h-3 w-3 text-emerald-600 shrink-0" />
              )}
            </span>
            {listing.owner.avg_rating != null && (
              <StarRating rating={listing.owner.avg_rating} size="sm" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">
              {Number(listing.price).toLocaleString()} {listing.currency}
            </span>
            {showStats && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" /> {listing.view_count}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageSquare className="h-3 w-3" /> {listing.message_count}
                </span>
              </div>
            )}
          </div>
          {listing.listing_type === "product" && listing.stock_quantity != null && (
            <div className="mt-1">
              <Badge
                variant={listing.stock_quantity > 0 ? "outline" : "destructive"}
                className="text-[10px] px-1.5 py-0 font-normal"
              >
                {listing.stock_quantity > 0
                  ? `${listing.stock_quantity} in stock`
                  : "Out of Stock"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
