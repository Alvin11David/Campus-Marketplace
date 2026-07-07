import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, BadgeCheck, Calendar, Flag, Package, Store, Star, MessageCircle } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/shared/star-rating";
import { ReportDialog } from "@/components/shared/report-dialog";
import { ListingCard } from "@/components/shared/listing-card";
import { StaggerFade, StaggerItem } from "@/components/shared/stagger-fade";
import { MOCK_LISTINGS, MOCK_REVIEWS } from "@/lib/mock-data";
import { CAMPUS_LOCATIONS, MOCK_USER } from "@/lib/api";
import type { User, Review } from "@/lib/api";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getCampusName(locationId: number | null) {
  if (!locationId) return null;
  return CAMPUS_LOCATIONS.find((l) => l.id === locationId)?.name || null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const profileUser: User = {
    ...MOCK_USER,
    id: Number(id) || 2,
    full_name: Number(id) === 2 ? "Taban James" :
               Number(id) === 3 ? "Sarah Nakato" :
               Number(id) === 4 ? "Grace Achieng" :
               Number(id) === 5 ? "Peter Okello" :
               Number(id) === 6 ? "Mary Wanzala" :
               Number(id) === 7 ? "John Kato" :
               Number(id) === 8 ? "Faith Namugenyi" :
               Number(id) === 9 ? "Dr. Sarah Mbabazi" : "Richard Seko Anundu",
    email: `user${id}@students.vu.ac.ug`,
    bio: Number(id) === 2 ? "Expert laptop repair technician with 2+ years of experience." :
         Number(id) === 3 ? "Professional printing and binding services at affordable rates." :
         Number(id) === 4 ? "Professional hair stylist specializing in braiding and weaves." :
         Number(id) === 5 ? "Computer science student selling gently used textbooks." :
         Number(id) === 6 ? "Campus entrepreneur offering phone accessories." :
         Number(id) === 7 ? "Laundry service provider with fast turnaround." :
         Number(id) === 8 ? "Event planner and decorator for all campus occasions." :
         Number(id) === 9 ? "PhD graduate offering research and statistics tutoring." : "Campus Marketplace user.",
    profile_photo_url: null,
    campus_location_id: [2, 3, 4, 5, 6, 7, 8, 9].includes(Number(id)) ? 1 : 1,
    is_provider: true,
    is_seller: [5, 6].includes(Number(id)),
    is_verified: true,
    avg_rating: Number(id) === 2 ? 4.8 :
                Number(id) === 3 ? 4.5 :
                Number(id) === 4 ? 4.9 :
                Number(id) === 5 ? 4.2 :
                Number(id) === 6 ? 4.4 :
                Number(id) === 7 ? 4.3 :
                Number(id) === 8 ? 4.6 :
                Number(id) === 9 ? 4.9 : 4.7,
    rating_count: Number(id) === 2 ? 9 :
                  Number(id) === 3 ? 8 :
                  Number(id) === 4 ? 15 :
                  Number(id) === 5 ? 6 :
                  Number(id) === 6 ? 7 :
                  Number(id) === 7 ? 11 :
                  Number(id) === 8 ? 5 :
                  Number(id) === 9 ? 20 : 12,
  };

  const campusName = getCampusName(profileUser.campus_location_id);
  const initials = getInitials(profileUser.full_name);

  const userListings = MOCK_LISTINGS.filter(
    (l) => l.owner_id === profileUser.id && l.status === "active"
  );

  const serviceListings = userListings.filter((l) => l.listing_type === "service");
  const productListings = userListings.filter((l) => l.listing_type === "product");

  const userListingIds = userListings.map((l) => l.id);
  const userReviews: Review[] = MOCK_REVIEWS.filter((r) =>
    userListingIds.includes(r.listing_id)
  );

  const hasContent = userListings.length > 0 || userReviews.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8 space-y-8 3xl:max-w-[1600px] 4xl:max-w-[1920px]"
    >
      <BackButton />

      {/* Profile header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={profileUser.profile_photo_url || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-2 pb-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">{profileUser.full_name}</h1>
                {profileUser.is_verified && (
                  <BadgeCheck className="h-5 w-5 text-emerald-600" />
                )}
              </div>
              {profileUser.bio && (
                <p className="text-muted-foreground text-sm max-w-xl">{profileUser.bio}</p>
              )}
              <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap text-sm text-muted-foreground">
                {campusName && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {campusName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Joined{" "}
                  {new Date(profileUser.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                {profileUser.is_provider && <Badge variant="secondary">Provider</Badge>}
                {profileUser.is_seller && <Badge variant="secondary">Seller</Badge>}
                {profileUser.avg_rating != null && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <StarRating rating={profileUser.avg_rating} size="sm" />
                    ({profileUser.rating_count})
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-center sm:justify-start pb-1">
              <ReportDialog
                targetType="user"
                targetId={profileUser.id}
                targetLabel={`User: ${profileUser.full_name}`}
                trigger={
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                    <Flag className="h-3.5 w-3.5" /> Report User
                  </Button>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings */}
      {userListings.length > 0 ? (
        <Tabs defaultValue={serviceListings.length > 0 ? "services" : "products"}>
          <TabsList className="w-full sm:w-auto">
            {serviceListings.length > 0 && (
              <TabsTrigger value="services" className="gap-2">
                <Store className="h-4 w-4" /> Services ({serviceListings.length})
              </TabsTrigger>
            )}
            {productListings.length > 0 && (
              <TabsTrigger value="products" className="gap-2">
                <Package className="h-4 w-4" /> Products ({productListings.length})
              </TabsTrigger>
            )}
          </TabsList>
          {serviceListings.length > 0 && (
            <TabsContent value="services">
              <StaggerFade className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4">
                {serviceListings.map((listing, i) => (
                  <StaggerItem key={listing.id} index={i}>
                    <ListingCard listing={listing} />
                  </StaggerItem>
                ))}
              </StaggerFade>
            </TabsContent>
          )}
          {productListings.length > 0 && (
            <TabsContent value="products">
              <StaggerFade className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5 gap-4">
                {productListings.map((listing, i) => (
                  <StaggerItem key={listing.id} index={i}>
                    <ListingCard listing={listing} />
                  </StaggerItem>
                ))}
              </StaggerFade>
            </TabsContent>
          )}
        </Tabs>
      ) : hasContent ? null : (
        <CartoonEmpty
          variant="package"
          title="No public listings"
          description="This user hasn't posted any services or products yet."
        />
      )}

      {/* Reviews */}
      {userReviews.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Reviews
            </CardTitle>
            <CardDescription>{userReviews.length} review{userReviews.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userReviews.map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {idx > 0 && <Separator className="mb-4" />}
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 ring-2 ring-muted">
                    <AvatarImage src={review.reviewer.profile_photo_url || undefined} />
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(review.reviewer.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{review.reviewer.full_name}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      ) : hasContent ? (
        <CartoonEmpty
          variant="star"
          title="No reviews yet"
          description="This user hasn't received any reviews."
        />
      ) : null}
    </motion.div>
  );
}
