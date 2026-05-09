import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/db";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Box, Search } from "lucide-react";
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
import AdminLayout from "@/components/AdminLayout";

interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const AdminCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      if (Array.isArray(data)) {
        setCategories(data as Category[]);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      setCategories([]);
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

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-white/10"
            />
          </div>
          <Button onClick={handleNewClick} className="w-full sm:w-auto gap-2 rounded-full shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4" /> New Category
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5">
            <Box className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground mb-4">No categories found</p>
            <Button variant="outline" onClick={handleNewClick} className="border-white/10">Create First Category</Button>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((category) => (
              <GlassCard key={category.id} className="p-6 border-white/5 hover:bg-white/5 transition-colors group">
                <div className="flex flex-col h-full justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                        <Box className="w-4 h-4" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => handleEdit(category)}>
                           <Pencil className="w-3.5 h-3.5" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => setDeletingId(category.id)}>
                           <Trash2 className="w-3.5 h-3.5" />
                         </Button>
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-lg">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{category.description}</p>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest font-bold">
                    ID: {category.id.slice(0, 8)} • {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Name</label>
              <Input
                placeholder="e.g., Electronics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
              <Textarea
                placeholder="Briefly describe what goes in this category..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background/50 border-white/10 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)} className="border-white/10 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="shadow-lg shadow-primary/20">
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. All products associated with this category will remain, but their category reference might break.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel className="border-white/10 bg-transparent">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletingId && handleDelete(deletingId)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete Permanently
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCategories;
