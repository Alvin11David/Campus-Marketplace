import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, MoreVertical, Pencil, Play, Pause, Trash2 } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ListingCard } from "@/components/shared/listing-card";
import { CartoonEmpty } from "@/components/shared/cartoon-empty";
import { useAuth } from "@/contexts/auth-context";
import { MOCK_LISTINGS } from "@/lib/mock-data";
import type { Listing } from "@/lib/api";

type StatusFilter = "all" | "active" | "paused" | "draft" | "deleted";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "draft", label: "Draft" },
  { value: "deleted", label: "Deleted" },
];

export default function MyListingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [listings, setListings] = useState(MOCK_LISTINGS);

  const myListings = user
    ? listings.filter((l) => l.owner_id === user.id)
    : [];

  const filteredListings =
    statusFilter === "all"
      ? myListings
      : myListings.filter((l) => l.status === statusFilter);

  const toggleStatus = (listing: Listing) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === listing.id
          ? { ...l, status: l.status === "active" ? ("paused" as const) : ("active" as const) }
          : l
      )
    );
    const newStatus = listing.status === "active" ? "paused" : "active";
    toast.success(`Listing ${newStatus === "active" ? "activated" : "paused"}`);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setListings((prev) =>
      prev.map((l) =>
        l.id === deleteTarget.id ? { ...l, status: "deleted" as const } : l
      )
    );
    setDeleteTarget(null);
    toast.success("Listing deleted");
  };

  const statusCounts = {
    all: myListings.length,
    active: myListings.filter((l) => l.status === "active").length,
    paused: myListings.filter((l) => l.status === "paused").length,
    draft: myListings.filter((l) => l.status === "draft").length,
    deleted: myListings.filter((l) => l.status === "deleted").length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 py-8 space-y-6 3xl:max-w-[1600px] 4xl:max-w-[1920px]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BackButton className="-ml-1" />
          <h1 className="text-2xl font-bold">My Listings</h1>
        </div>
        <Button asChild className="gap-2">
          <Link to="/listings/new">
            <PlusCircle className="h-4 w-4" /> New Listing
          </Link>
        </Button>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => setStatusFilter(v as StatusFilter)}
      >
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
              {tab.label}
              <span className="text-xs text-muted-foreground">
                ({statusCounts[tab.value]})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredListings.length === 0 ? (
        <CartoonEmpty
          variant="listing"
          title="No listings found"
          description={statusFilter === "all"
            ? "You haven't created any listings yet. Start by creating your first one!"
            : `You don't have any ${statusFilter} listings.`}
          action={statusFilter === "all" ? (
            <Button asChild size="sm">
              <Link to="/listings/new">
                <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Listing
              </Link>
            </Button>
          ) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredListings.map((listing) => (
              <motion.div
                key={listing.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="relative group">
                  <ListingCard listing={listing} showStats />

                  {/* Status badge overlay */}
                  {listing.status !== "active" && (
                    <div className="absolute top-2 left-2 z-10">
                      {listing.status === "paused" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 text-[10px] font-medium">
                          <Pause className="h-2.5 w-2.5" /> Paused
                        </span>
                      )}
                      {listing.status === "draft" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
                          Draft
                        </span>
                      )}
                      {listing.status === "deleted" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-medium">
                          Deleted
                        </span>
                      )}
                    </div>
                  )}

                  {/* Dropdown menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm hover:bg-background"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => navigate(`/listings/${listing.id}/edit`)}>
                        <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                      </DropdownMenuItem>
                      {listing.status !== "deleted" && (
                        <DropdownMenuItem onClick={() => toggleStatus(listing)}>
                          {listing.status === "active" ? (
                            <><Pause className="h-3.5 w-3.5 mr-2" /> Pause</>
                          ) : (
                            <><Play className="h-3.5 w-3.5 mr-2" /> Activate</>
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(listing)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Delete confirmation dialog */}
                <Dialog
                  open={deleteTarget?.id === listing.id}
                  onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                  }}
                >
                  <DialogTrigger asChild>
                    <span />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Listing</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete "{listing.title}"?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={handleDelete}>
                        Yes, Delete
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
