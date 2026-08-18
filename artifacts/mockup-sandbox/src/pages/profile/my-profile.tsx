import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Loader2, Package, Star, MessageSquare, AlertTriangle, Save, Store, ShieldAlert, List, MapPin, Phone, User, BadgeCheck } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { StarRating } from "@/components/shared/star-rating";
import { StaggerFade, StaggerItem } from "@/components/shared/stagger-fade";
import { useAuth } from "@/contexts/auth-context";
import { apiPatch, apiPost, fetchLocations, API_BASE } from "@/lib/api";
import type { CampusLocation } from "@/lib/api";
import { cn } from "@/lib/utils";

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 4xl:max-w-4xl">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-32 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  );
}

export default function MyProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    campus_location_id: user?.campus_location_id ?? null,
  });
  const [isProvider, setIsProvider] = useState(user?.is_provider ?? false);
  const [isSeller, setIsSeller] = useState(user?.is_seller ?? false);
  const [providerDialogOpen, setProviderDialogOpen] = useState(false);
  const [sellerDialogOpen, setSellerDialogOpen] = useState(false);
  const [pendingProvider, setPendingProvider] = useState(false);
  const [pendingSeller, setPendingSeller] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const token = localStorage.getItem("cm_token");
      const res = await fetch(`${API_BASE}/users/me/photo`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Upload failed";
        try { const err = JSON.parse(text); if (err.detail?.includes("MaxUpload")) msg = "Photo too large (max 10MB)"; } catch {}
        throw new Error(msg);
      }
      await refreshUser();
      toast.success("Photo updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const initials = user?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "";

  const handleProviderToggle = (checked: boolean) => {
    if (!checked && isProvider) {
      setPendingProvider(false);
      setProviderDialogOpen(true);
    } else {
      setIsProvider(checked);
    }
  };

  const confirmProviderDisable = () => {
    setIsProvider(false);
    setProviderDialogOpen(false);
  };

  const handleSellerToggle = (checked: boolean) => {
    if (!checked && isSeller) {
      setPendingSeller(false);
      setSellerDialogOpen(true);
    } else {
      setIsSeller(checked);
    }
  };

  const confirmSellerDisable = () => {
    setIsSeller(false);
    setSellerDialogOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch("/users/me", {
        fullName: form.full_name,
        bio: form.bio,
        phone: form.phone,
        campusLocationId: form.campus_location_id,
      });
      await apiPatch("/users/me/roles", { isProvider, isSeller });
      await refreshUser();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchLocations().then(setLocations); }, []);

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8 space-y-8 4xl:max-w-4xl"
    >
      <div className="flex items-center justify-between">
        <BackButton />
        
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Profile header card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-xl">
                <AvatarImage src={user.profile_photo_url || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 backdrop-blur-[1px]">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md hover:shadow-lg transition-all"
                title="Change photo"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1 pb-1">
              <h1 className="text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
                {user.full_name}
                {user.is_verified && <BadgeCheck className="h-5 w-5 text-emerald-600" />}
              </h1>
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <p className="text-xs text-muted-foreground">Joined {joinDate}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                {user.is_verified && <Badge variant="default" className="bg-emerald-600">Verified</Badge>}
                {isProvider && <Badge variant="secondary">Provider</Badge>}
                {isSeller && <Badge variant="secondary">Seller</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reputation card */}
      {(isProvider || isSeller) && user.avg_rating != null && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center">
                  <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold">{user.avg_rating.toFixed(1)}</p>
                  <StarRating rating={user.avg_rating} size="sm" />
                </div>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-xl font-semibold">{user.rating_count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Edit Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-4 gap-5">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell others about yourself..."
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campus">Campus Location</Label>
            <Select
              value={form.campus_location_id?.toString() || ""}
              onValueChange={(v) => setForm({ ...form, campus_location_id: Number(v) })}
            >
              <SelectTrigger id="campus" className="w-full sm:w-72 h-11">
                <SelectValue placeholder="Select a campus location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id.toString()}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Account Roles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <CardTitle>Account Roles</CardTitle>
          </div>
          <CardDescription>Enable provider or seller features on your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium cursor-pointer">Service Provider</Label>
              </div>
              <p className="text-sm text-muted-foreground">Offer services like tutoring, repairs, printing</p>
            </div>
            <Switch checked={isProvider} onCheckedChange={handleProviderToggle} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium cursor-pointer">Seller</Label>
              </div>
              <p className="text-sm text-muted-foreground">Sell products like textbooks, snacks, accessories</p>
            </div>
            <Switch checked={isSeller} onCheckedChange={handleSellerToggle} />
          </div>
        </CardContent>
      </Card>

      {/* Quick links */}
      <StaggerFade className="grid grid-cols-1 sm:grid-cols-2 3xl:grid-cols-3 gap-4">
        <StaggerItem index={0}>
          <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            onClick={() => navigate("/my-listings")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <List className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">My Listings</h3>
                <p className="text-sm text-muted-foreground">Manage your services and products</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem index={1}>
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Reviews Received</h3>
                <p className="text-sm text-muted-foreground">See what others are saying</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerFade>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4 border-destructive/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Deactivate Account</AlertTitle>
            <AlertDescription>
              Once deactivated, your listings will be hidden and you won't receive messages.
            </AlertDescription>
          </Alert>
          <Dialog open={deactivateDialogOpen} onOpenChange={(o) => { if (!o) { setDeactivateDialogOpen(false); setDeactivatePassword(""); } }}>
            <DialogTrigger asChild>
              <Button variant="destructive">Deactivate Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate Account</DialogTitle>
                <DialogDescription>
                  Enter your password to confirm deactivation. Your listings will be hidden and you will not receive new messages. You can reactivate anytime by logging in.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="deactivate-password">Password</Label>
                  <Input
                    id="deactivate-password"
                    type="password"
                    value={deactivatePassword}
                    onChange={(e) => setDeactivatePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    className="h-11"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setDeactivatePassword("")}>Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={!deactivatePassword.trim() || deactivating}
                  onClick={async () => {
                    setDeactivating(true);
                    try {
                      await apiPost("/users/me/deactivate", {
                        password: deactivatePassword,
                        reason: "User requested",
                      });
                      await logout();
                      navigate("/login", { replace: true });
                      toast.success("Account deactivated");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Failed to deactivate");
                    } finally {
                      setDeactivating(false);
                      setDeactivateDialogOpen(false);
                      setDeactivatePassword("");
                    }
                  }}
                >
                  {deactivating ? "Deactivating..." : "Yes, Deactivate"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Confirmation dialogs */}
      <Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Provider Role</DialogTitle>
            <DialogDescription>
              Disabling the provider role will pause all your service listings. You can re-enable it anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmProviderDisable}>
              Yes, Disable
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={sellerDialogOpen} onOpenChange={setSellerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Seller Role</DialogTitle>
            <DialogDescription>
              Disabling the seller role will pause all your product listings. You can re-enable it anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmSellerDisable}>
              Yes, Disable
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
