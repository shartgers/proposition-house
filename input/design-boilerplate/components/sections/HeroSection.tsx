import Link from "next/link";
import { Button } from "@/components/ui/button";

type HeroSectionProps = {
  headline?: string;
  subheadline?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function HeroSection({
  headline = "Build calm, premium products faster",
  subheadline = "A portable design system with teal accents, soft shadows, generous spacing, and shadcn/ui components — ready to copy into your next app.",
  primaryCta = { label: "Open dashboard", href: "/dashboard" },
  secondaryCta = { label: "View styleguide", href: "/styleguide" },
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden gradient-subtle section-padding">
      <div className="container-soft">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <BadgePill>New boilerplate</BadgePill>
          <h1 className="mt-6 font-heading tracking-tight text-foreground">
            {headline}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            {subheadline}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href={primaryCta.href}>
              <Button size="lg" className="px-8">
                {primaryCta.label}
              </Button>
            </Link>
            <Link href={secondaryCta.href}>
              <Button size="lg" variant="outline" className="px-8">
                {secondaryCta.label}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function BadgePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="pill inline-flex items-center border border-border bg-card text-sm text-muted-foreground shadow-soft">
      {children}
    </span>
  );
}
