"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import type { DemoProject } from "@/lib/demo/projects";

type ProjectListProps = {
  projects: DemoProject[];
  loading?: boolean;
  onDelete: (projectId: string) => void;
  onCreateProject?: () => void;
};

export function ProjectList({
  projects,
  loading,
  onDelete,
  onCreateProject,
}: ProjectListProps) {
  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-72 rounded-lg" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">No projects yet</p>
        <p className="mt-2 text-sm text-muted-foreground/70">
          Create your first project to get started
        </p>
        {onCreateProject && (
          <Button className="mt-6" onClick={onCreateProject}>
            Get Started
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}
