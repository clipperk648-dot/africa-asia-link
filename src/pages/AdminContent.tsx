import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getContentPages, createContentPage, updateContentPage, deleteContentPage } from "@/lib/db";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Pencil, Trash2, Eye } from "lucide-react";
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

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  created_at: string;
}

const AdminContent = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    published: false,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }
    loadPages();
  }, [currentUser, navigate]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getContentPages();
      if (Array.isArray(data)) {
        setPages(data as ContentPage[]);
      } else {
        setPages([]);
      }
    } catch (error) {
      console.error("Failed to load content pages:", error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const slug = formData.slug || generateSlug(formData.title);

      if (editingPage) {
        await updateContentPage(
          editingPage.id,
          formData.title,
          slug,
          formData.content,
          formData.published
        );
        toast.success("Page updated successfully");
      } else {
        await createContentPage(
          formData.title,
          slug,
          formData.content,
          formData.published
        );
        toast.success("Page created successfully");
      }
      resetForm();
      loadPages();
    } catch (error) {
      toast.error("Failed to save page");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContentPage(id);
      toast.success("Page deleted successfully");
      setDeletingId(null);
      loadPages();
    } catch (error) {
      toast.error("Failed to delete page");
      console.error(error);
    }
  };

  const handleEdit = (page: ContentPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      published: page.published,
    });
    setShowNewDialog(true);
  };

  const handleNewClick = () => {
    resetForm();
    setEditingPage(null);
    setShowNewDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      content: "",
      published: false,
    });
    setShowNewDialog(false);
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
              <h1 className="text-xl font-bold">Content Management</h1>
            </div>
            <Button variant="gradient" size="sm" onClick={handleNewClick} className="gap-2">
              <Plus className="w-4 h-4" />
              New Page
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading content pages...</p>
        ) : pages.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No content pages yet</p>
            <Button onClick={handleNewClick}>Create First Page</Button>
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {pages.map((page) => (
              <GlassCard key={page.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg">{page.title}</h3>
                      {page.published ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-bold rounded-full uppercase">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-full uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">/{page.slug}</p>
                    <p className="text-sm text-muted-foreground/70 mt-2 line-clamp-2">
                      {page.content}
                    </p>
                    <p className="text-xs text-muted-foreground/50 mt-2">
                      Created {new Date(page.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {page.published && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          window.open(`/${page.slug}`, "_blank");
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(page)}
                      className="gap-2"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingId(page.id)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? "Edit Page" : "Create New Page"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Page title"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (!editingPage) {
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(e.target.value),
                    }));
                  }
                }}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL Slug</label>
              <Input
                placeholder="page-slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Page content..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1"
                rows={8}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={formData.published}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, published: checked })
                }
              />
              <label className="text-sm font-medium">Publish page</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingPage ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The content page will be permanently deleted.
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

export default AdminContent;
