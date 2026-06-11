"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import { ProjectList } from "@/components/dashboard/ProjectList";
import { Button } from "@/components/ui/button";
import {
  demoUser,
  initialProjects,
  type DemoProject,
} from "@/lib/demo/projects";

export function DashboardPageClient() {
  const router = useRouter();
  const [projects, setProjects] = useState<DemoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Simulate post-login data fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(initialProjects);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const sortedSidebarProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [projects]
  );

  const handleCreateProject = (name: string) => {
    const newProject: DemoProject = {
      id: crypto.randomUUID(),
      name,
      domain: "General",
      description: "New project — add context and artifacts to get started.",
      updatedAt: new Date().toISOString(),
      progress: { total: 6, completed: 0, percentage: 0 },
    };
    setProjects((current) => [newProject, ...current]);
    toast.success(`Project "${name}" created.`);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects((current) => current.filter((project) => project.id !== projectId));
  };

  return (
    <AppShell
      brandName="Soft Focus"
      sidebarProjects={sortedSidebarProjects}
      user={demoUser}
      onCreateProject={() => setCreateDialogOpen(true)}
      onSignOut={() => {
        toast.message("Signed out (demo)");
        router.push("/");
      }}
    >
      <div className="container-soft-full py-4">
        <div className="mb-4 layout-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-lg font-semibold">Your Projects</h1>
            <p className="text-xs text-muted-foreground">
              Manage and track your product specification projects
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>Create project</Button>
        </div>

        <ProjectList
          projects={projects}
          loading={loading}
          onDelete={handleDeleteProject}
          onCreateProject={() => setCreateDialogOpen(true)}
        />

        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onCreate={handleCreateProject}
        />
      </div>
    </AppShell>
  );
}
