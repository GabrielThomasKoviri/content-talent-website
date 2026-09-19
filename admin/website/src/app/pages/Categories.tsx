import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { FolderTree, Plus, Edit, Trash2, ArrowUp, ArrowDown, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  ApiCategory,
} from "../services/apiService";

function CategoryDialog({
  open,
  onClose,
  category,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  category?: ApiCategory | null;
  onSave: (data: { name: string; description: string; icon: string; color: string }) => Promise<void>;
}) {
  const isEdit = !!category;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#8b5cf6");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setDescription(category?.description ?? "");
      setIcon(category?.icon ?? "📁");
      setColor(category?.color ?? "#8b5cf6");
      setError(null);
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        icon: icon.trim() || "📁",
        color: color.trim() || "#8b5cf6",
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-slate-200/80 text-slate-900 max-w-md rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-slate-900 text-lg font-bold tracking-tight">
            {isEdit ? `Edit "${category?.name}"` : "Create New Category"}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm mt-1">
            {isEdit ? "Update category attributes and visual identifier." : "Add a new content category for your media catalog."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Label className="text-sm font-semibold text-slate-800 block mb-1.5">Category Name</Label>
            <Input
              placeholder="e.g., Programming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white border-slate-200 text-slate-900 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-800 block mb-1.5">Description</Label>
            <Textarea
              placeholder="Brief description of this content category"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white border-slate-200 text-slate-900 rounded-xl resize-none text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-800 block mb-1.5">Icon (Emoji)</Label>
              <Input
                placeholder="💻"
                maxLength={4}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 text-center rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-800 block mb-1.5">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10.5 p-1 bg-white border-slate-200 cursor-pointer rounded-xl"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 font-mono text-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Category Badge Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shadow-xs border border-slate-200/80"
                style={{ backgroundColor: `${color}20` }}
              >
                {icon || "📁"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-900 truncate">{name || "Category Name"}</div>
                <div className="text-xs text-slate-500 truncate">{description || "Category description will appear here..."}</div>
              </div>
              <div className="h-4 w-4 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: color }} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold shadow-xs h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 rounded-xl shadow-xs text-sm h-10"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ApiCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCategoriesList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList();
  }, []);

  const handleCreateCategory = async (data: { name: string; description: string; icon: string; color: string }) => {
    const created = await createCategory(data);
    setCategories((prev) => [...prev, created]);
  };

  const handleUpdateCategory = async (data: { name: string; description: string; icon: string; color: string }) => {
    if (!editCategory) return;
    const updated = await updateCategory(editCategory.id, data);
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err?.message || "Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newCategories = [...categories];
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    setCategories(newCategories);

    try {
      const ids = newCategories.map((c) => c.id);
      await reorderCategories(ids);
    } catch (err) {
      console.warn("Failed to persist category order", err);
      // Revert if API fails
      fetchCategoriesList();
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <CategoryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateCategory}
      />
      <CategoryDialog
        open={!!editCategory}
        onClose={() => setEditCategory(null)}
        category={editCategory}
        onSave={handleUpdateCategory}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-white border border-slate-200/80 text-slate-900 max-w-sm rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 text-base font-bold tracking-tight">Delete Category?</DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-1 leading-relaxed">
              Are you sure you want to delete <span className="text-slate-900 font-semibold">"{deleteTarget?.name}"</span>?
              Linked video assets will remain intact and be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={actionLoading}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCategory}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-xs text-xs"
            >
              {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">Organize and structure your video content catalog with custom categories</p>
        </div>
        <Button
          className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs font-semibold"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-900 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading categories catalog...</p>
        </Card>
      ) : error ? (
        <Card className="bg-white border border-red-200 shadow-xs rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <p className="text-sm text-red-800 font-semibold">{error}</p>
          <Button variant="outline" onClick={fetchCategoriesList} className="gap-2 border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs text-xs font-semibold">
            <RefreshCw className="h-3.5 w-3.5" /> Retry Request
          </Button>
        </Card>
      ) : categories.length === 0 ? (
        <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl p-12 text-center space-y-3">
          <FolderTree className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No categories found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">You haven't created any categories yet. Create your first category to start organizing videos.</p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs text-xs font-semibold">
            <Plus className="h-4 w-4" /> Create Category
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Detailed Category List with Reorder Controls */}
          <Card className="bg-white border border-slate-200/80 shadow-xs rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>All Categories ({categories.length})</span>
                <span className="text-xs font-normal text-slate-500">Use arrow controls to reorder display sequence</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl hover:bg-slate-100/70 transition-all group"
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Icon & Color Badge */}
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shadow-xs border border-slate-200/80 shrink-0"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {cat.icon || "📁"}
                  </div>

                  {/* Category Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-900 truncate">{cat.name}</h3>
                      <Badge variant="outline" className="bg-slate-200/70 border-0 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {cat.contentCount ?? 0} videos
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {cat.description || "No description provided."}
                    </p>
                  </div>

                  {/* Theme Color Indicator */}
                  <div
                    className="h-4 w-4 rounded-full border border-slate-300 shadow-xs shrink-0 hidden sm:block"
                    style={{ backgroundColor: cat.color }}
                    title={`Color: ${cat.color}`}
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditCategory(cat)}
                      className="h-8 w-8 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl shadow-xs"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteTarget(cat)}
                      className="h-8 w-8 bg-white border border-slate-200 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl shadow-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
