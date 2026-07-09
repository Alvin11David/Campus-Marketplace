import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X, Save, Send } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { apiGet, apiPost, mapCategory, CAMPUS_LOCATIONS } from "@/lib/api";
import type { Category } from "@/lib/api";
import { cn } from "@/lib/utils";

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category_id?: string;
  campus_location_id?: string;
  stock_quantity?: string;
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listingType, setListingType] = useState<"service" | "product">("service");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
const [categoryId, setCategoryId] = useState("");
const [customCategoryName, setCustomCategoryName] = useState("");
const [showCustomCategory, setShowCustomCategory] = useState(false);
const [campusLocationId, setCampusLocationId] = useState("");
const [stockQuantity, setStockQuantity] = useState("");
const [categories, setCategories] = useState<Category[]>([]);
const [images, setImages] = useState<string[]>([]);
const [errors, setErrors] = useState<FormErrors>({});
const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    apiGet<any[]>("/categories")
      .then((data) => setCategories((data ?? []).map(mapCategory)))
      .catch(() => {});
  }, []);

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
    if (!categoryId && !customCategoryName.trim()) newErrors.category_id = "Category is required";
    if (!campusLocationId) newErrors.campus_location_id = "Campus location is required";
    if (listingType === "product" && (!stockQuantity.trim() || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0))
      newErrors.stock_quantity = "Valid stock quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createListing = async (status?: string) => {
    if (!validate()) return;
    setPublishing(true);
    try {
      let resolvedCategoryId = categoryId;

      if (!resolvedCategoryId && customCategoryName.trim()) {
        const newCat = await apiPost<any>("/categories", {
          name: customCategoryName.trim(),
          listingTypeHint: listingType,
        });
        resolvedCategoryId = String(newCat.id);
        setCategories((prev) => [...prev, { ...newCat, icon_name: newCat.iconName ?? "Package", listing_type_hint: newCat.listingTypeHint, is_active: true, active_listing_count: 0 }]);
      }

      const data = await apiPost<any>("/listings", {
        title,
        description,
        listingType: listingType,
        categoryId: Number(resolvedCategoryId),
        price: Number(price),
        currency: "UGX",
        stockQuantity: listingType === "product" ? Number(stockQuantity) : null,
        campusLocationId: Number(campusLocationId),
        imageUrls: images.length > 0 ? images : undefined,
      });
      toast.success("Listing published", { description: "Your listing is now live." });
      navigate(`/listings/${data.id}`);
    } catch {
      toast.error("Failed to publish listing");
    } finally {
      setPublishing(false);
    }
  };

  const handleImageSelect = () => {
    if (images.length < 5) {
      setImages((prev) => [...prev, `mock-image-${prev.length + 1}`]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTypeChange = (value: string) => {
    setListingType(value as "service" | "product");
    setCategoryId("");
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-8 space-y-8 4xl:max-w-4xl"
    >
      <div className="flex items-center gap-4">
        <BackButton fallback="/my-listings" label="Cancel" />
        <h1 className="text-2xl font-bold">Create New Listing</h1>
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
          <CardDescription>Provide information about your {listingType}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={listingType === "service" ? "e.g. Laptop Screen Repair" : "e.g. Python Textbook"}
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
              placeholder="Describe what you're offering in detail..."
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
                placeholder="25000"
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              {showCustomCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="Type a new category name"
                    className={errors.category_id ? "border-destructive" : ""}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setShowCustomCategory(false); setCustomCategoryName(""); }}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select value={categoryId} onValueChange={(v) => {
                  if (v === "__custom__") {
                    setShowCustomCategory(true);
                    setCategoryId("");
                  } else {
                    setCategoryId(v);
                    setCustomCategoryName("");
                  }
                }}>
                  <SelectTrigger id="category" className={errors.category_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">+ Add new category...</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
                  {CAMPUS_LOCATIONS.map((loc) => (
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
                  placeholder="10"
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
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              images.length >= 5 ? "border-muted bg-muted/20" : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            {images.length >= 5 ? (
              <p className="text-sm text-muted-foreground">Maximum 5 images reached</p>
            ) : (
              <div className="space-y-2">
                <ImagePlus className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Drag and drop images here</p>
                <p className="text-xs text-muted-foreground">or click the button below to select files</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleImageSelect}
              disabled={images.length >= 5}
              className="gap-2"
            >
              <ImagePlus className="h-4 w-4" /> Select Images
            </Button>
            <span className="text-xs text-muted-foreground">{images.length} / 5 images</span>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {images.map((_, idx) => (
                <div key={idx} className="relative h-20 w-20 rounded-md bg-muted flex items-center justify-center group">
                  <span className="text-xs text-muted-foreground">Image {idx + 1}</span>
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

      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/my-listings">Cancel</Link>
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => createListing()} disabled={publishing} className="gap-2">
            <Save className="h-4 w-4" /> {publishing ? "Saving..." : "Save as Draft"}
          </Button>
          <Button onClick={() => createListing()} disabled={publishing} className="gap-2">
            <Send className="h-4 w-4" />
            {publishing ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
