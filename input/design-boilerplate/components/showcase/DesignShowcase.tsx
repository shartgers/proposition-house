"use client";

import { toast } from "sonner";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const colorSwatches = [
  { name: "Primary", className: "bg-primary text-primary-foreground" },
  { name: "Secondary", className: "bg-secondary text-secondary-foreground" },
  { name: "Muted", className: "bg-muted text-muted-foreground" },
  { name: "Accent", className: "bg-accent text-accent-foreground" },
  { name: "Card", className: "bg-card text-card-foreground border" },
  { name: "Destructive", className: "bg-destructive text-destructive-foreground" },
];

export function DesignShowcase() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader brandName="Soft Focus" />

      <div className="pt-16">
        <section className="section-padding gradient-subtle border-b">
          <div className="container-soft">
            <h1 className="font-heading">Styleguide</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Live reference for tokens, typography, components, and layout patterns from the Soft Focus design system.
            </p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-soft layout-stack gap-spacious">
            <Section title="Colors" description="Semantic tokens from globals.css">
              <div className="layout-grid sm:grid-cols-2 lg:grid-cols-3">
                {colorSwatches.map((swatch) => (
                  <div
                    key={swatch.name}
                    className={`rounded-lg p-comfortable shadow-soft ${swatch.className}`}
                  >
                    {swatch.name}
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Typography" description="Outfit headings, DM Sans body">
              <div className="layout-stack rounded-lg border bg-card p-comfortable shadow-soft">
                <p className="text-heading text-3xl">Heading — Outfit 600</p>
                <p className="text-body text-base">
                  Body text uses DM Sans with comfortable line height for forms, tables, and long copy.
                </p>
                <p className="text-sm text-muted-foreground">
                  Muted foreground for secondary labels and helper text.
                </p>
              </div>
            </Section>

            <Section title="Buttons" description="Primary, secondary, outline, ghost, link">
              <div className="layout-flex flex-wrap">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button size="sm">Small</Button>
                <Button size="lg">Large</Button>
              </div>
            </Section>

            <Section title="Badges & alerts">
              <div className="layout-flex flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Informational alert</AlertTitle>
                <AlertDescription>
                  Use alerts for inline status messages with icon support.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error state</AlertTitle>
                <AlertDescription>
                  Destructive variant for validation or failure messages.
                </AlertDescription>
              </Alert>
            </Section>

            <Section title="Forms" description="Inputs with focus ring matching primary teal">
              <Card className="max-w-md shadow-soft">
                <CardHeader>
                  <CardTitle>Example form</CardTitle>
                  <CardDescription>Rounded inputs, muted placeholders</CardDescription>
                </CardHeader>
                <CardContent className="layout-stack">
                  <div className="layout-stack gap-tight">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" />
                  </div>
                  <Button className="w-full sm:w-auto">Submit</Button>
                </CardContent>
              </Card>
            </Section>

            <Section title="Cards & effects" description="shadow-soft, hover-lift, glass, pill">
              <div className="layout-grid md:grid-cols-3">
                <Card className="hover-lift shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Hover lift</CardTitle>
                    <CardDescription>Subtle elevation on hover</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="glass border-border/60">
                  <CardHeader>
                    <CardTitle className="text-lg">Glass</CardTitle>
                    <CardDescription>Backdrop blur surface</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="gradient-primary border-0 text-primary-foreground">
                  <CardHeader>
                    <CardTitle className="text-lg text-inherit">Gradient</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      Primary gradient fill
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <span className="pill inline-block bg-muted text-sm">Pill utility</span>
            </Section>

            <Section title="Toasts">
              <Button
                variant="outline"
                onClick={() =>
                  toast.success("Saved", {
                    description: "Your changes were applied.",
                  })
                }
              >
                Show toast
              </Button>
            </Section>

            <Section title="Layout utilities" description="container-soft, layout-stack, gap-comfortable">
              <div className="rounded-lg border border-dashed border-border p-comfortable">
                <div className="container-soft-left layout-stack gap-comfortable">
                  <div className="rounded-md bg-muted p-compact-sm">container-soft-left</div>
                  <div className="layout-flex">
                    <div className="rounded-md bg-accent p-compact-sm flex-1">layout-flex</div>
                    <div className="rounded-md bg-accent p-compact-sm flex-1">item</div>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </section>

        <SiteFooter brandName="Soft Focus" />
      </div>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="layout-stack gap-comfortable">
      <div>
        <h2 className="font-heading text-2xl">{title}</h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="layout-stack gap-comfortable">{children}</div>
    </div>
  );
}
