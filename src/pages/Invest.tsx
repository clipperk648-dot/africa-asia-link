import React, { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";

type Project = {
  id: string;
  ownerId: string | null;
  title: string;
  description: string;
  target: number;
  funded: number;
};

const STORAGE_KEY = "echina_projects_v1";

const load = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const save = (projects: Project[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

const Invest = () => {
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState<number | "">("");

  useEffect(() => {
    setProjects(load());
  }, []);

  const createProject = () => {
    if (!title || !description || !target || Number(target) <= 0) {
      toast.error("Please provide valid project details");
      return;
    }
    const p: Project = {
      id: Date.now().toString(36),
      ownerId: user?.id ?? null,
      title,
      description,
      target: Number(target),
      funded: 0,
    };
    const next = [p, ...projects];
    setProjects(next);
    save(next);
    setTitle("");
    setDescription("");
    setTarget("");
    toast.success("Project created");
  };

  const invest = (id: string) => {
    const amountStr = prompt("Enter amount to invest (₦)");
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    const next = projects.map((p) => (p.id === id ? { ...p, funded: p.funded + amount } : p));
    setProjects(next);
    save(next);
    toast.success(`Invested ₦${amount.toLocaleString()}`);
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Investment Marketplace</h1>

        <section>
          <GlassCard className="p-4 space-y-3">
            <h2 className="font-bold">Create a project to raise funds</h2>
            <Input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Input placeholder="Target amount (₦)" value={target as any} onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")} />
            <div className="flex gap-2">
              <Button onClick={createProject} variant="gradient">Create Project</Button>
              <Button variant="outline" onClick={() => { setTitle(""); setDescription(""); setTarget(""); }}>Reset</Button>
            </div>
          </GlassCard>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold">Available Projects</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">No projects yet. Create the first one!</p>
          ) : (
            projects.map((p) => (
              <GlassCard key={p.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                    <p className="text-xs mt-2">Funded: ₦{p.funded.toLocaleString()} / ₦{p.target.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button onClick={() => invest(p.id)} variant="gradient">Invest</Button>
                    {p.ownerId === (user?.id ?? null) && <span className="text-xs text-muted-foreground">Your project</span>}
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

export default Invest;
