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
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">
            {isEdit ? `Edit "${category?.name}"` : "Create New Category"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEdit ? "Update category attributes" : "Add a new content category for your media catalog"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Label className="text-xs text-slate-300">Category Name</Label>
            <Input
              placeholder="e.g., Programming"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 bg-slate-950 border-slate-800 text-slate-100 focus:border-purple-500"
            />
          </div>

          <div>
            <Label className="text-xs text-slate-300">Description</Label>
            <Textarea
              placeholder="Brief description of this content category"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 bg-slate-950 border-slate-800 text-slate-100 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-slate-300">Icon (Emoji)</Label>
              <Input
                placeholder="💻"
                maxLength={4}
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="mt-1 bg-slate-950 border-slate-800 text-slate-100 focus:border-purple-500 text-center"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-300">Theme Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-9 p-1 bg-slate-950 border-slate-800 cursor-pointer rounded-lg"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 focus:border-purple-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="border border-slate-800 rounded-xl p-3.5 bg-slate-950/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Category Badge Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-xl shadow-sm border border-white/10"
                style={{ backgroundColor: `${color}30` }}
              >
                {icon || "📁"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-100 truncate">{name || "Category Name"}</div>
                <div className="text-xs text-slate-400 truncate">{description || "Category description will appear here..."}</div>
              </div>
              <div className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: color }} />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
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
    <div className="space-y-6 text-slate-100">
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
        <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-base">Delete Category?</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Are you sure you want to delete <span className="text-slate-200 font-semibold">"{deleteTarget?.name}"</span>?
              Linked video assets will remain intact and be unassigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={actionLoading}
              className="bg-slate-800 border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteCategory}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-500 text-white font-medium"
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">Categories</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">Organize and structure your video content catalog with custom categories</p>
        </div>
        <Button
          className="gap-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <Card className="bg-slate-900/80 border-slate-800 p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading categories catalog...</p>
        </Card>
      ) : error ? (
        <Card className="bg-slate-900/80 border-red-900/50 p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
          <p className="text-sm text-red-300 font-medium">{error}</p>
          <Button variant="outline" onClick={fetchCategoriesList} className="gap-2 bg-slate-800 border-slate-700 text-slate-200">
            <RefreshCw className="h-4 w-4" /> Retry Request
          </Button>
        </Card>
      ) : categories.length === 0 ? (
        <Card className="bg-slate-900/80 border-slate-800 p-12 text-center space-y-3">
          <FolderTree className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-200">No categories found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">You haven't created any categories yet. Create your first category to start organizing videos.</p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-500 text-white text-xs">
            <Plus className="h-4 w-4" /> Create Category
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Detailed Category List with Reorder Controls */}
          <Card className="bg-slate-900/80 border border-slate-800/80 shadow-xl">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center justify-between">
                <span>All Categories ({categories.length})</span>
                <span className="text-xs font-normal text-slate-400">Use arrow controls to reorder display sequence</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-purple-500/40 transition-all group"
                >
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1 text-slate-500 hover:text-purple-400 disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1 text-slate-500 hover:text-purple-400 disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Icon & Color Badge */}
                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10 shrink-0"
                    style={{ backgroundColor: `${cat.color}30` }}
                  >
                    {cat.icon || "📁"}
                  </div>

                  {/* Category Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-slate-100 truncate">{cat.name}</h3>
                      <Badge variant="outline" className="bg-purple-950/60 border-purple-800/60 text-purple-300 text-[10px] px-2 py-0.5 rounded-full">
                        {cat.contentCount ?? 0} videos
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {cat.description || "No description provided."}
                    </p>
                  </div>

                  {/* Theme Color Indicator */}
                  <div
                    className="h-5 w-5 rounded-full border border-white/20 shrink-0 hidden sm:block"
                    style={{ backgroundColor: cat.color }}
                    title={`Color: ${cat.color}`}
                  />

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditCategory(cat)}
                      className="h-8 w-8 bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteTarget(cat)}
                      className="h-8 w-8 bg-slate-900 border-slate-800 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cards Grid Overview */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card key={cat.id} className="bg-slate-900/80 border-slate-800/80 hover:border-purple-500/30 transition-all flex flex-col justify-between">
                <CardHeader className="border-b border-slate-800/80 p-4 pb-3" style={{ borderBottomColor: `${cat.color}40` }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-lg shadow-sm border border-white/10 shrink-0"
                      style={{ backgroundColor: `${cat.color}30` }}
                    >
                      {cat.icon || "📁"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm font-semibold text-slate-100 truncate">{cat.name}</CardTitle>
                      <p className="text-xs text-purple-400 font-medium">{cat.contentCount ?? 0} published items</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditCategory(cat)}
                      className="flex-1 bg-slate-950 border-slate-800 text-xs text-slate-300 hover:text-white"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1 text-purple-400" /> Edit Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
