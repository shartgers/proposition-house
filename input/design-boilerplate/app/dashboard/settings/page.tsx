import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { demoUser, initialProjects } from "@/lib/demo/projects";

export default function SettingsPage() {
  return (
    <AppShell
      brandName="Soft Focus"
      sidebarProjects={initialProjects}
      user={demoUser}
      homeHref="/dashboard"
    >
      <div className="container-soft-full py-4 layout-stack gap-comfortable max-w-2xl">
        <div>
          <h1 className="font-heading text-lg font-semibold">Settings</h1>
          <p className="text-xs text-muted-foreground">
            Placeholder settings page using the same post-login shell.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    </AppShell>
  );
}
