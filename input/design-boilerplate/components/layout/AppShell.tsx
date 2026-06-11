"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import {
  FolderPlus,
  Menu,
  PanelLeftClose,
  PanelRightOpen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import type { DemoProject, DemoUser } from "@/lib/demo/projects";

type AppShellProps = {
  children: ReactNode;
  brandName?: string;
  homeHref?: string;
  activeProjectId?: string;
  sidebarProjects?: DemoProject[];
  user?: DemoUser;
  onCreateProject?: () => void;
  onSignOut?: () => void;
};

/**
 * Post-login app shell — mirrors FluidSpecs MainLayout sidebar and content area.
 */
export function AppShell({
  children,
  brandName = "Your App",
  homeHref = "/dashboard",
  activeProjectId,
  sidebarProjects = [],
  user,
  onCreateProject,
  onSignOut,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const renderSidebarNav = (collapsed: boolean) => (
    <nav className="space-y-1">
      {!collapsed && (
        <div className="mb-3 px-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            My Projects
          </h3>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          onCreateProject?.();
          setMobileMenuOpen(false);
        }}
        title={collapsed ? "Create project" : undefined}
        className={`flex w-full items-center rounded-lg px-2 py-2 text-sm font-normal text-foreground transition-colors hover:bg-background/50 ${
          collapsed ? "justify-center" : "gap-2"
        }`}
      >
        <FolderPlus className={`${collapsed ? "h-5 w-5" : "h-4 w-4"} shrink-0`} />
        {!collapsed && <span>Create project</span>}
      </button>

      {sidebarProjects.length > 0 ? (
        <div className="space-y-1">
          {sidebarProjects.slice(0, 4).map((project) => {
            const isActive = activeProjectId === project.id;
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                title={collapsed ? project.name : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : "gap-2"
                } ${
                  isActive
                    ? "bg-background/80 text-foreground shadow-xs"
                    : "text-foreground hover:bg-background/50"
                }`}
              >
                <svg
                  className={`${collapsed ? "h-5 w-5" : "h-4 w-4"} shrink-0`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                {!collapsed && <span className="truncate">{project.name}</span>}
              </Link>
            );
          })}
        </div>
      ) : (
        !collapsed && (
          <p className="px-2 py-2 text-sm text-muted-foreground">No projects</p>
        )
      )}
    </nav>
  );

  const sidebarHeader = (collapsed: boolean) => (
    <div className="shrink-0 border-b border-border p-2">
      <div className="flex items-center gap-2">
        {!collapsed && (
          <Link
            href={homeHref}
            className="flex flex-1 items-center gap-2 px-1 transition-colors hover:opacity-80"
          >
            <span className="font-heading text-base font-semibold text-foreground truncate">
              {brandName}
            </span>
          </Link>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`h-7 w-7 p-0 shrink-0 ${collapsed ? "mx-auto" : ""}`}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelRightOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen min-w-0 overflow-hidden flex-col">
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="fixed left-0 top-0 h-full w-[280px] max-w-[85vw] translate-x-0 translate-y-0 rounded-none border-r p-0 duration-300 ease-out data-[state=open]:animate-slide-in-from-left data-[state=closed]:animate-slide-out-to-left [&>button]:hidden">
          <DialogTitle className="sr-only">Navigation menu</DialogTitle>
          <div className="flex h-full flex-col bg-accent">
            <div className="shrink-0 border-b border-border p-4 layout-between">
              <Link
                href={homeHref}
                onClick={() => setMobileMenuOpen(false)}
                className="font-heading text-base font-semibold text-foreground"
              >
                {brandName}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 p-0"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">{renderSidebarNav(false)}</div>
            {user && (
              <div className="border-t border-border py-2 pl-3 pr-2">
                <UserProfileMenu user={user} onSignOut={onSignOut} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex min-w-0 flex-1 overflow-hidden">
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-accent transition-all duration-300 ${
            sidebarCollapsed ? "w-14" : "w-64"
          }`}
        >
          <div className="flex h-full flex-col">
            {sidebarHeader(sidebarCollapsed)}
            <div className="flex-1 overflow-y-auto p-2">
              {renderSidebarNav(sidebarCollapsed)}
            </div>
            {user && (
              <div className="border-t border-border py-2 pl-3 pr-2">
                <UserProfileMenu
                  user={user}
                  collapsed={sidebarCollapsed}
                  onSignOut={onSignOut}
                />
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-background">
          <div className="shrink-0 md:hidden flex items-center gap-2 border-b border-border bg-background px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="h-9 w-9 p-0 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href={homeHref} className="font-heading text-base font-semibold truncate">
              {brandName}
            </Link>
          </div>
          <div className="flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
