import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Layers, Shield, Zap } from "lucide-react";

const features = [
  {
    title: "Design tokens",
    description:
      "CSS variables for teal primary, aqua muted tones, soft shadows, and spacing scales.",
    icon: Sparkles,
  },
  {
    title: "Layout utilities",
    description:
      "container-soft, layout-stack, section-padding, and hover-lift patterns out of the box.",
    icon: Layers,
  },
  {
    title: "Accessible UI",
    description:
      "shadcn-style components with focus rings, semantic colors, and WCAG-friendly contrast.",
    icon: Shield,
  },
  {
    title: "App + marketing",
    description:
      "SiteHeader, AppShell, hero, features grid, and CTA sections for both surfaces.",
    icon: Zap,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="section-padding bg-background">
      <div className="container-soft">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading tracking-tight">Everything you need to match the look</h2>
          <p className="mt-4 text-muted-foreground">
            Copy the folder, swap your brand name, and start building on a consistent foundation.
          </p>
        </div>

        <div className="mt-12 layout-grid sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="hover-lift border-border/80">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
