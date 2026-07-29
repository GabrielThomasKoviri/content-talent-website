import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { FolderTree, Plus, Edit, Trash2, GripVertical } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";

type Category = {
  id: number; name: string; description: string;
  contentCount: number; color: string; icon: string;
};

const initialCategories: Category[] = [
  { id: 1, name: "Education", description: "Educational content and tutorials", contentCount: 124, color: "#8b5cf6", icon: "📚" },
  { id: 2, name: "Programming", description: "Coding tutorials and software development", contentCount: 98, color: "#3b82f6", icon: "💻" },
  { id: 3, name: "Design", description: "UI/UX design and creative content", contentCount: 56, color: "#ec4899", icon: "🎨" },
  { id: 4, name: "Technology", description: "Tech reviews and industry insights", contentCount: 42, color: "#10b981", icon: "🚀" },
  { id: 5, name: "Business", description: "Entrepreneurship and business strategies", contentCount: 38, color: "#f59e0b", icon: "💼" },
  { id: 6, name: "Lifestyle", description: "Lifestyle tips and personal development", contentCount: 31, color: "#06b6d4", icon: "✨" },
];

function CategoryDialog({ open, onClose, category }: {
  open: boolean; onClose: () => void; category?: Category;
}) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [color, setColor] = useState(category?.color ?? "#8b5cf6");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit "${category!.name}"` : "Create New Category"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the category details" : "Add a new category to organize your content"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Category Name</Label>
            <Input placeholder="e.g., Programming" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea placeholder="Brief description of this category" rows={3}
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Icon (Emoji)</Label>
              <Input placeholder="💻" maxLength={2} value={icon} onChange={(e) => setIcon(e.target.value)} />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-16 h-10" />
                <Input value={color} onChange={(e) => setColor(e.target.value)} />
              </div>
            </div>
          </div>
          {/* Live preview */}
          <div className="border rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg flex items-center justify-center text-xl"
                style={{ backgroundColor: `${color}20` }}>
                {icon || "?"}
              </div>
              <div>
                <div className="font-medium text-sm">{name || "Category Name"}</div>
                <div className="text-xs text-gray-500">{description || "Description"}</div>
              </div>
              <div className="h-6 w-6 rounded ml-auto" style={{ backgroundColor: color }} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>{isEdit ? "Save Changes" : "Create Category"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Categories() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  return (
    <div className="space-y-6">
      <CategoryDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <CategoryDialog open={!!editCategory} onClose={() => setEditCategory(null)} category={editCategory ?? undefined} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your content with custom categories</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />Add Category
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>All Categories</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {initialCategories.map((category) => (
              <div key={category.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                <div className="cursor-move"><GripVertical className="h-5 w-5 text-gray-400" /></div>
                <div className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${category.color}20` }}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    <Badge variant="secondary">{category.contentCount} items</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div className="h-8 w-8 rounded" style={{ backgroundColor: category.color }} />
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => setEditCategory(category)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {initialCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="border-b" style={{ borderBottomColor: category.color }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${category.color}20` }}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-gray-600">{category.contentCount} items</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View Content</Button>
                <Button variant="outline" size="sm" onClick={() => setEditCategory(category)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
