import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X, Save, Trash2, AlertTriangle } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { apiGet, apiPatch, apiDelete, mapCategory, mapListing, fetchLocations } from "@/lib/api";
import type { Category, Listing, CampusLocation } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category_id?: string;
  campus_location_id?: string;
  stock_quantity?: string;
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [listingType, setListingType] = useState<"service" | "product">("service");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [campusLocationId, setCampusLocationId] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      apiGet<any>(`/listings/${id}`).then(mapListing),
      apiGet<any[]>("/categories").then((data) => (data ?? []).map(mapCategory)),
      fetchLocations().then(setLocations),
    ])
      .then(([listingData, cats]) => {
        if (user && listingData.owner.id !== user.id) {
          setForbidden(true);
          return;
        }
        setListing(listingData);
        setCategories(cats);
        setListingType(listingData.listing_type);
        setTitle(listingData.title);
        setDescription(listingData.description);
        setPrice(String(listingData.price));
        setCategoryId(String(listingData.category_id));
        setCampusLocationId(String(listingData.campus_location_id));
        setStockQuantity(listingData.stock_quantity != null ? String(listingData.stock_quantity) : "");
        setImages(listingData.images.map((img: any) => img.image_url));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Listing Not Found</h1>
        <p className="text-muted-foreground mb-6">This listing doesn't exist or has been removed.</p>
        <Button asChild><Link to="/my-listings">Back to My Listings</Link></Button>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have permission to edit this listing.</p>
        <Button asChild><Link to="/my-listings">Back to My Listings</Link></Button>
      </div>
    );
  }

  const filteredCategories: Category[] = categories.filter((c) => {
    if (listingType === "service") return c.listing_type_hint === "service" || c.listing_type_hint === "both";
    return c.listing_type_hint === "product" || c.listing_type_hint === "both";
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      newErrors.price = "Valid price is required";
    if (!categoryId) newErrors.category_id = "Category is required";
    if (!campusLocationId) newErrors.campus_location_id = "Campus location is required";
    if (listingType === "product" && (!stockQuantity.trim() || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0))
      newErrors.stock_quantity = "Valid stock quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await apiPatch(`/listings/${id}`, {
        title,
        description,
        price: Number(price),
        currency: "UGX",
        stockQuantity: listingType === "product" ? Number(stockQuantity) : null,
        categoryId: Number(categoryId),
        campusLocationId: Number(campusLocationId),
      });
      toast.success("Listing updated");
      navigate(`/listings/${id}`);
    } catch {
      toast.error("Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await apiDelete(`/listings/${id}`);
      setDeleteDialogOpen(false);
      toast.success("Listing deleted");
      navigate("/my-listings");
    } catch {
      toast.error("Failed to delete listing");
    } finally {
      setSaving(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - images.length;
    const selected = files.slice(0, remaining);

    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTypeChange = (value: string) => {
    setListingType(value as "service" | "product");
    setCategoryId("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8 space-y-8 4xl:max-w-4xl"
    >
      <div className="flex items-center gap-4">
        <BackButton fallback={`/listings/${id}`} label="Cancel" />
        <h1 className="text-2xl font-bold">Edit Listing</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Type</CardTitle>
          <CardDescription>Choose whether you're offering a service or selling a product</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={listingType} onValueChange={handleTypeChange} className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="service" className="flex-1 sm:flex-none">Service</TabsTrigger>
              <TabsTrigger value="product" className="flex-1 sm:flex-none">Product</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
          <CardDescription>Update information about your {listingType}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (UGX)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category" className={errors.category_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campus">Campus Location</Label>
              <Select value={campusLocationId} onValueChange={setCampusLocationId}>
                <SelectTrigger id="campus" className={errors.campus_location_id ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((loc) => (
                    <SelectItem key={loc.id} value={loc.id.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.campus_location_id && <p className="text-sm text-destructive">{errors.campus_location_id}</p>}
            </div>

            {listingType === "product" && (
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className={errors.stock_quantity ? "border-destructive" : ""}
                />
                {errors.stock_quantity && <p className="text-sm text-destructive">{errors.stock_quantity}</p>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
          <CardDescription>Upload up to 5 images (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
              const remaining = 5 - images.length;
              const selected = files.slice(0, remaining);
              selected.forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  setImages((prev) => [...prev, ev.target?.result as string]);
                };
                reader.readAsDataURL(file);
              });
            }}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              images.length >= 5 ? "border-muted bg-muted/20 cursor-default" : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            {images.length >= 5 ? (
              <p className="text-sm text-muted-foreground">Maximum 5 images reached</p>
            ) : (
              <div className="space-y-2">
                <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Drag and drop images here</p>
                <p className="text-xs text-muted-foreground">or click to select files</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 5}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" /> Select Images
            </Button>
            <span className="text-xs text-muted-foreground">{images.length} / 5 images</span>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((src, idx) => (
                <div key={idx} className="relative h-20 w-20 rounded-md overflow-hidden bg-muted group">
                  <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible listing actions</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Delete Listing</AlertTitle>
            <AlertDescription>
              Once deleted, this listing and all its reviews will be permanently removed.
            </AlertDescription>
          </Alert>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete Listing
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Listing</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{title}"? This action cannot be undone.
                  All reviews associated with this listing will also be removed.
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
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to={`/listings/${id}`}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </motion.div>
  );
}
