import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/db";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const AdminCategories = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }
    loadCategories();
  }, [currentUser, navigate]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data as Category[]);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData.name, formData.description);
        toast.success("Category updated successfully");
      } else {
        await createCategory(formData.name, formData.description);
        toast.success("Category created successfully");
      }
      setFormData({ name: "", description: "" });
      setEditingCategory(null);
      setShowNewDialog(false);
      loadCategories();
    } catch (error) {
      toast.error("Failed to save category");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully");
      setDeletingId(null);
      loadCategories();
    } catch (error) {
      toast.error("Failed to delete category");
      console.error(error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setShowNewDialog(true);
  };

  const handleNewClick = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setShowNewDialog(true);
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Category Management</h1>
            </div>
            <Button variant="gradient" size="sm" onClick={handleNewClick} className="gap-2">
              <Plus className="w-4 h-4" />
              New Category
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading categories...</p>
        ) : categories.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No categories yet</p>
            <Button onClick={handleNewClick}>Create First Category</Button>
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <GlassCard key={category.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground/50 mt-2">
                      Created {new Date(category.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingId(category.id)}
                      className="text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category Name</label>
              <Input
                placeholder="e.g., Electronics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Optional description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Ensure no products are using this category before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletingId && handleDelete(deletingId)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminCategories;
