import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { ServicesGrid } from "@/components/sections/services-grid";
import { Advantages } from "@/components/sections/advantages";
import { CasesPreview } from "@/components/sections/cases-preview";
import { CTASection } from "@/components/sections/cta-section";
import { DashboardPreview } from "@/components/sections/dashboard-preview";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="relative">
        <Hero />
        <DashboardPreview />
        <ServicesGrid />
        <CasesPreview />
        <Advantages />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
