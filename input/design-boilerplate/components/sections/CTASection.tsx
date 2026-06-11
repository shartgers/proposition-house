import Link from "next/link";
import { Button } from "@/components/ui/button";

type CTASectionProps = {
  headline?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function CTASection({
  headline = "Ready to start your next project?",
  description = "Copy this boilerplate into a fresh Next.js app and customize colors, fonts, and layout to match your brand.",
  ctaLabel = "Open styleguide",
  ctaHref = "/styleguide",
}: CTASectionProps) {
  return (
    <section className="bg-primary py-20 sm:py-32">
      <div className="container-soft">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading tracking-tight text-primary-foreground sm:text-4xl">
            {headline}
          </h2>
          <p className="mt-6 text-lg leading-8 text-primary-foreground/90">
            {description}
          </p>
          <div className="mt-10">
            <Link href={ctaHref}>
              <Button size="lg" variant="secondary" className="px-8">
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
