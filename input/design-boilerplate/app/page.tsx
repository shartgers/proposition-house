import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { CTASection } from "@/components/sections/CTASection";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader brandName="Soft Focus" />
      <div className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <CTASection />
        <SiteFooter brandName="Soft Focus" />
      </div>
    </main>
  );
}
