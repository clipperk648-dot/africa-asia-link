import { useEffect, useState } from "react";
import { getContentPages, createContentPage, updateContentPage, deleteContentPage } from "@/lib/db";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, FileText, Globe, Search, Check, X, ExternalLink } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  created_at: string;
}

const AdminContent = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({ 
    title: "", 
    slug: "", 
    content: "", 
    published: false 
  });

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await getContentPages();
      setPages(data as ContentPage[]);
    } catch (error) {
      toast.error("Failed to load content pages");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Title and Slug are required");
      return;
    }

    try {
      if (editingPage) {
        await updateContentPage(editingPage.id, formData.title, formData.slug, formData.content, formData.published);
        toast.success("Page updated successfully");
      } else {
        await createContentPage(formData.title, formData.slug, formData.content, formData.published);
        toast.success("Page created successfully");
      }
      setShowDialog(false);
      loadPages();
    } catch (error) {
      toast.error("Failed to save page");
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
    }
  };

  const handleEdit = (page: ContentPage) => {
    setEditingPage(page);
    setFormData({ 
      title: page.title, 
      slug: page.slug, 
      content: page.content, 
      published: page.published 
    });
    setShowDialog(true);
  };

  const handleNew = () => {
    setEditingPage(null);
    setFormData({ title: "", slug: "", content: "", published: false });
    setShowDialog(true);
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-white/10"
            />
          </div>
          <Button onClick={handleNew} className="w-full sm:w-auto gap-2 rounded-full shadow-lg shadow-primary/10">
            <Plus className="w-4 h-4" /> New Page
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredPages.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground mb-4">No content pages found</p>
            <Button variant="outline" onClick={handleNew} className="border-white/10">Create First Page</Button>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {filteredPages.map((page) => (
              <GlassCard key={page.id} className="p-5 border-white/5 hover:bg-white/5 transition-colors group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-white truncate">{page.title}</h3>
                        {page.published ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">Published</span>
                        ) : (
                          <span className="bg-white/5 text-muted-foreground border border-white/10 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase">Draft</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Globe className="w-3 h-3" /> /{page.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 gap-2 text-xs font-bold border border-white/5 hover:bg-white/5"
                      onClick={() => handleEdit(page)}
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 text-red-400 hover:text-red-300 hover:bg-red-400/10 border border-white/5"
                      onClick={() => setDeletingId(page.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? "Edit Content Page" : "Create New Content Page"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                <Input
                  placeholder="e.g., Privacy Policy"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-background/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">URL Slug</label>
                <Input
                  placeholder="e.g., privacy-policy"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-background/50 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content (HTML/Markdown support)</label>
              <Textarea
                placeholder="Write your page content here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="bg-background/50 border-white/10 min-h-[250px] font-mono text-sm"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-white">Publish Page</p>
                <p className="text-[10px] text-muted-foreground">Make this page visible to the public immediately.</p>
              </div>
              <Switch 
                checked={formData.published} 
                onCheckedChange={(val) => setFormData({ ...formData, published: val })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-white/10 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleSave} className="shadow-lg shadow-primary/20">
              {editingPage ? "Update Page" : "Publish Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content Page?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently remove the page from the platform. Links to this slug will lead to a 404 error.
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

export default AdminContent;
