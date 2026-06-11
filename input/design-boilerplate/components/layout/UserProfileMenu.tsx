"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Settings, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DemoUser } from "@/lib/demo/projects";

type UserProfileMenuProps = {
  user: DemoUser;
  collapsed?: boolean;
  onSignOut?: () => void;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Sidebar user card — matches FluidSpecs post-login profile menu pattern.
 */
export function UserProfileMenu({
  user,
  collapsed = false,
  onSignOut,
}: UserProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(user.name);
  const isFreePlan = user.plan === "Free";

  const menuItems = (
    <>
      <DropdownMenuLabel className="px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/70 text-sm font-medium text-white">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/dashboard/settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link href="#" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Upgrade plan
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => {
          onSignOut?.();
          setOpen(false);
        }}
        className="text-muted-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </>
  );

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 w-full">
        {isFreePlan && (
          <Link
            href="#"
            title="Upgrade plan"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-background/50"
            aria-label="Upgrade plan"
          >
            <Star className="h-4 w-4" />
          </Link>
        )}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary transition-colors hover:bg-background/50 hover:ring-2 hover:ring-primary/20"
              aria-label="User menu"
            >
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56" sideOffset={8}>
            {menuItems}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className="flex flex-1 items-center gap-2.5 min-w-0 text-left rounded-lg transition-colors hover:opacity-90 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-1"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted-foreground/70 text-xs font-medium text-white">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.plan}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56" sideOffset={8}>
          {menuItems}
        </DropdownMenuContent>
      </DropdownMenu>
      {isFreePlan && (
        <Link
          href="#"
          className="shrink-0 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}
