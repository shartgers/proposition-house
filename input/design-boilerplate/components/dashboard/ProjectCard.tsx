"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DemoProject } from "@/lib/demo/projects";

type ProjectCardProps = {
  project: DemoProject;
  onDelete: (projectId: string) => void;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    onDelete(project.id);
    toast.success(`Project "${project.name}" deleted.`);
    setIsDeleting(false);
  };

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-soft-lg">
      <CardHeader>
        <CardTitle className="line-clamp-1 truncate min-w-0 text-lg">
          {project.name}
        </CardTitle>
        <CardDescription className="truncate min-w-0">
          {project.domain}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {project.progress.completed}/{project.progress.total} artifacts
            </span>
          </div>
          <Progress value={project.progress.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {project.progress.percentage}% complete
          </p>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col items-start gap-3">
        <div className="text-xs text-muted-foreground">
          Updated {formatDate(project.updatedAt)}
        </div>
        <div className="flex w-full gap-2">
          <Button className="flex-1" variant="default">
            Open
          </Button>
          <Button
            variant="outline"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
