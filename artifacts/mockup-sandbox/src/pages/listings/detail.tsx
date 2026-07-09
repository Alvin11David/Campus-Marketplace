import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, MessageSquare, Star, ChevronLeft, ChevronRight, Send, ShoppingBag, Wrench, ArrowRight, Pencil, Trash2, Flag, BadgeCheck } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { StarRating } from "@/components/shared/star-rating";
import { ReportDialog } from "@/components/shared/report-dialog";
import { ListingCard } from "@/components/shared/listing-card";
import { useAuth } from "@/contexts/auth-context";
import { apiGet, apiPost, apiPatch, apiDelete, mapListing, mapReview, type Review } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getInitials(name: string) {
  return name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const listing = MOCK_LISTINGS.find((l) => l.id === Number(id));

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS.filter((r) => r.listing_id === Number(id)));
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  if (!listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Listing Not Found</h1>
        <p className="text-muted-foreground mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <Button asChild><Link to="/my-listings">Back to My Listings</Link></Button>
      </div>
    );
  }

  const isOwner = user?.id === listing.owner_id;
  const listingReviews: Review[] = reviews;
  const currentUserId = user?.id;

  const allImages = [
    ...(listing.primary_image_url ? [listing.primary_image_url] : []),
    ...listing.images.map((img) => img.image_url),
  ];

  const relatedListings = MOCK_LISTINGS.filter(
    (l) => l.id !== listing.id && l.status === "active" && l.category.id === listing.category.id
  ).slice(0, 3);

  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    await new Promise((r) => setTimeout(r, 500));
    const newReview: Review = {
      id: Date.now(),
      listing_id: listing.id,
      reviewer: {
        id: user?.id || 0,
        full_name: user?.full_name || "You",
        profile_photo_url: null,
      },
      rating: reviewRating,
      comment: reviewComment || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setReviews((prev) => [newReview, ...prev]);
    setSubmittingReview(false);
    setReviewDialogOpen(false);
    setReviewComment("");
    setReviewRating(5);
    toast.success("Review submitted", { description: "Your review has been posted." });
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
    setEditDialogOpen(true);
  };

  const handleSaveEditReview = async () => {
    if (!editingReview) return;
    setSubmittingReview(true);
    await new Promise((r) => setTimeout(r, 400));
    setReviews((prev) =>
      prev.map((r) =>
        r.id === editingReview.id
          ? { ...r, rating: editRating, comment: editComment || null, updated_at: new Date().toISOString() }
          : r
      )
    );
    setSubmittingReview(false);
    setEditDialogOpen(false);
    setEditingReview(null);
    toast.success("Review updated");
  };

  const handleDeleteReview = async () => {
    if (!deleteTarget) return;
    await new Promise((r) => setTimeout(r, 300));
    setReviews((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("Review deleted");
  };

  const handleMessage = () => {
    const existing = MOCK_CONVERSATIONS.find(
      (c) => c.listing_id === listing.id && c.other_participant.id === listing.owner_id
    );
    if (existing) {
      navigate(`/messages/${existing.id}`);
    } else {
      navigate(`/messages?new=true&listingId=${listing.id}&userId=${listing.owner_id}`);
    }
  };

  const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    paused: "bg-amber-100 text-amber-800 border-amber-200",
    draft: "bg-slate-100 text-slate-800 border-slate-200",
    deleted: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 3xl:max-w-[1600px] 4xl:max-w-[1920px]">
      <BackButton fallback="/my-listings" />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 3xl:grid-cols-4 gap-8">
        <div className="lg:col-span-2 3xl:col-span-3 space-y-6">
          <Card className="overflow-hidden border-primary/5">
            <div className="relative bg-muted">
              <div className="aspect-[16/9] flex items-center justify-center overflow-hidden">
                {allImages.length > 0 ? (
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={allImages[currentImageIndex]}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-2xl bg-background/60 flex items-center justify-center">
                      {listing.listing_type === "service" ? (
                        <Wrench className="h-10 w-10 text-muted-foreground/60" />
                      ) : (
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/60" />
                      )}
                    </div>
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          i === currentImageIndex ? "w-6 bg-primary" : "w-1.5 bg-background/60"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold">{listing.title}</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-primary/20">{listing.category.name}</Badge>
                    <Badge variant="secondary" className="bg-secondary/10">
                      {listing.listing_type === "service" ? "Service" : "Product"}
                    </Badge>
                    <span className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold", statusColor[listing.status])}>
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-bold text-primary">
                    {Number(listing.price).toLocaleString()} {listing.currency}
                  </p>
                  {listing.listing_type === "product" && listing.stock_quantity != null && (
                    <p className={cn("text-sm mt-1", listing.stock_quantity > 0 ? "text-emerald-600" : "text-destructive")}>
                      {listing.stock_quantity > 0 ? `${listing.stock_quantity} in stock` : "Out of Stock"}
                    </p>
                  )}
                </div>
              </div>

              {listing.avg_rating != null && (
                <div className="flex items-center gap-2">
                  <StarRating rating={listing.avg_rating} size="md" showValue />
                  <span className="text-sm text-muted-foreground">
                    ({listing.rating_count} {listing.rating_count === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}

              <Separator />

              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" /> {listing.campus_location.name}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="border-primary/5">
            <CardHeader>
              <CardTitle>Reviews ({listingReviews.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {listingReviews.length === 0 ? (
                <CartoonEmpty
                  variant="star"
                  title="No reviews yet"
                  description="Be the first to leave one!"
                  action={!isOwner ? (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setReviewDialogOpen(true)}>
                      <Star className="h-4 w-4" /> Write a Review
                    </Button>
                  ) : undefined}
                />
              ) : (
                listingReviews.map((review, idx) => {
                  const isMyReview = currentUserId === review.reviewer.id;
                  return (
                    <div key={review.id}>
                      {idx > 0 && <Separator className="mb-4" />}
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10 ring-1 ring-border">
                          <AvatarImage src={review.reviewer.profile_photo_url || undefined} />
                          <AvatarFallback className="text-xs">
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
                          <div className="flex items-center gap-2 mt-2">
                            <ReportDialog
                              targetType="review"
                              targetId={review.id}
                              targetLabel={`Review by ${review.reviewer.full_name}`}
                              trigger={
                                <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs text-muted-foreground px-1">
                                  <Flag className="h-3 w-3" /> Report
                                </Button>
                              }
                            />
                            {isMyReview && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 h-7 text-xs text-muted-foreground px-1"
                                  onClick={() => handleEditReview(review)}
                                >
                                  <Pencil className="h-3 w-3" /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 h-7 text-xs text-destructive px-1"
                                  onClick={() => setDeleteTarget(review)}
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {!isOwner && listingReviews.length > 0 && (
                <div className="pt-4">
                  <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2 active:scale-95 transition-transform">
                        <Star className="h-4 w-4" /> Leave a Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Leave a Review</DialogTitle>
                        <DialogDescription>
                          Share your experience with this {listing.listing_type}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rating</label>
                          <StarRating rating={reviewRating} size="lg" interactive onRate={setReviewRating} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Comment (optional)</label>
                          <Textarea
                            rows={3}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Describe your experience..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSubmitReview} disabled={submittingReview} className="gap-2">
                          <Send className="h-4 w-4" />
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-primary/5">
            <CardHeader>
              <CardTitle>Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                  <AvatarImage src={listing.owner.profile_photo_url || undefined} />
                  <AvatarFallback>{getInitials(listing.owner.full_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm">{listing.owner.full_name}</p>
                    {listing.owner.is_verified && (
                      <BadgeCheck className="h-4 w-4 text-emerald-600" />
                    )}
                  </div>
                  {listing.owner.avg_rating != null && (
                    <StarRating rating={listing.owner.avg_rating} size="sm" showValue />
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to={`/profile/${listing.owner_id}`}>View Profile</Link>
              </Button>
              {!isOwner && (
                <ReportDialog
                  targetType="user"
                  targetId={listing.owner_id}
                  targetLabel={`User: ${listing.owner.full_name}`}
                  trigger={
                    <Button variant="ghost" size="sm" className="w-full gap-1.5 text-xs text-muted-foreground">
                      <Flag className="h-3.5 w-3.5" /> Report User
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/5">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {listing.campus_location.name}
              </div>
            </CardContent>
          </Card>

          {!isOwner && (
            <Button
              className="w-full gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
              size="lg"
              onClick={handleMessage}
            >
              <MessageSquare className="h-5 w-5" /> Message Provider
            </Button>
          )}
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Related Listings</h2>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" asChild>
              <Link to={`/search?q=${encodeURIComponent(listing.category.name)}`}>
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 4xl:grid-cols-5">
            {relatedListings.map((related) => (
              <ListingCard key={related.id} listing={related} />
            ))}
          </div>
        </section>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
            <DialogDescription>Update your rating and comment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <StarRating rating={editRating} size="lg" interactive onRate={setEditRating} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Comment (optional)</label>
              <Textarea
                rows={3}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Update your comment..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveEditReview} disabled={submittingReview}>
              {submittingReview ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteReview}>
              Yes, Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
