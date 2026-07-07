import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import type { Category } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CategoryForm {
  name: string;
  slug: string;
  listing_type_hint: "service" | "product" | "both";
  description: string;
}

const defaultForm: CategoryForm = {
  name: "",
  slug: "",
  listing_type_hint: "both",
  description: "",
};

export default function AdminCategories() {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(defaultForm);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    const newCat: Category = {
      id: Math.max(...categories.map((c) => c.id)) + 1,
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
      listing_type_hint: form.listing_type_hint,
      icon_name: "Package",
      description: form.description || null,
      is_active: true,
      active_listing_count: 0,
    };
    setCategories((prev) => [...prev, newCat]);
    setShowAddDialog(false);
    setForm(defaultForm);
    toast.success(`Category "${newCat.name}" created`);
  }

  function handleSaveEdit() {
    if (!editingCategory) return;
    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: form.name,
              slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
              listing_type_hint: form.listing_type_hint,
              description: form.description || null,
            }
          : c
      )
    );
    setEditingCategory(null);
    setForm(defaultForm);
    toast.success("Category updated");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setCategories((prev) => prev.map((c) =>
      c.id === deleteTarget.id ? { ...c, is_active: false } : c
    ));
    setDeleteTarget(null);
    toast.success(`Category "${deleteTarget.name}" retired`);
  }

  function openEdit(cat: Category) {
    setForm({
      name: cat.name,
      slug: cat.slug,
      listing_type_hint: cat.listing_type_hint,
      description: cat.description || "",
    });
    setEditingCategory(cat);
  }

  function openAdd() {
    setForm(defaultForm);
    setShowAddDialog(true);
  }

  const formIsValid = form.name.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Category Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add, rename, or retire listing categories
          </p>
        </div>
        <Button onClick={openAdd} className="gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{filtered.length} categor{filtered.length === 1 ? "y" : "ies"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            <AnimatePresence mode="popLayout">
              {filtered.map((cat) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className={cn(
                    "flex items-center justify-between px-6 py-4 transition-colors hover:bg-muted/50",
                    !cat.is_active && "opacity-50"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{cat.name}</span>
                      {!cat.is_active && (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">Retired</Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {cat.listing_type_hint}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      /{cat.slug} &middot; {cat.active_listing_count} listing{cat.active_listing_count !== 1 ? "s" : ""}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{cat.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(cat)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    {cat.is_active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => setDeleteTarget(cat)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={showAddDialog || !!editingCategory}
        onOpenChange={(o) => { if (!o) { setShowAddDialog(false); setEditingCategory(null); setForm(defaultForm); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details below." : "Create a new listing category."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Photography"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-slug">URL Slug</Label>
              <Input
                id="cat-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Auto-generated from name"
              />
              <p className="text-[10px] text-muted-foreground">Leave empty to auto-generate from the name</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-type">Listing Type Hint</Label>
              <Select
                value={form.listing_type_hint}
                onValueChange={(v) => setForm({ ...form, listing_type_hint: v as CategoryForm["listing_type_hint"] })}
              >
                <SelectTrigger id="cat-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Services only</SelectItem>
                  <SelectItem value="product">Products only</SelectItem>
                  <SelectItem value="both">Both services & products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description (optional)</Label>
              <Input
                id="cat-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this category"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={editingCategory ? handleSaveEdit : handleAdd} disabled={!formIsValid} className="gap-2">
              {editingCategory ? (
                <><Check className="h-4 w-4" /> Save Changes</>
              ) : (
                <><Plus className="h-4 w-4" /> Create Category</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Retire Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retire Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to retire <strong>{deleteTarget?.name}</strong>?
              It will no longer appear in the category list and listings in this category will be hidden from browse.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <Trash2 className="h-4 w-4" /> Retire Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
