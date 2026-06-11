"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavLink = {
  label: string;
  href: string;
};

type SiteHeaderProps = {
  brandName?: string;
  navLinks?: NavLink[];
  loginHref?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

const defaultNavLinks: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Styleguide", href: "/styleguide" },
];

/**
 * Fixed public header — blur backdrop, centered nav, mobile drawer.
 * Customize brand name and links via props.
 */
export function SiteHeader({
  brandName = "Your App",
  navLinks = defaultNavLinks,
  loginHref = "/dashboard",
  ctaLabel = "Open dashboard",
  ctaHref = "/dashboard",
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80 shadow-xs">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-heading text-lg font-semibold text-foreground">
            {brandName}
          </Link>

          <nav
            className="hidden md:flex items-center justify-center gap-6 flex-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            <Link
              href={loginHref}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Log in
            </Link>
            <Link href={ctaHref}>
              <Button size="sm">{ctaLabel}</Button>
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-primary"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={loginHref}
                className="block rounded-md px-3 py-2 text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href={ctaHref}
                className="block rounded-md px-3 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full" size="sm">
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
