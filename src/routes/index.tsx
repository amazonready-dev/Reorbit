import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/reorbit/Nav";
import { Hero } from "@/components/reorbit/Hero";
import { HowItWorks } from "@/components/reorbit/HowItWorks";
import { Features } from "@/components/reorbit/Features";
import { ROICalculator } from "@/components/reorbit/ROICalculator";
import { Pricing } from "@/components/reorbit/Pricing";
import { WaitlistForm } from "@/components/reorbit/WaitlistForm";
import { FAQ } from "@/components/reorbit/FAQ";
import { Footer } from "@/components/reorbit/Footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Reorbit — AI Post-Purchase Engine for Shopify" },
      {
        name: "description",
        content:
          "Turn one-time Shopify buyers into repeat revenue. Reorbit's AI sends personalized post-purchase upsells and win-back campaigns automatically.",
      },
      { property: "og:title", content: "Reorbit — Turn one-time buyers into repeat revenue" },
      {
        property: "og:description",
        content:
          "AI-powered post-purchase upsells and win-back campaigns for Shopify. Live in 5 minutes. Pays for itself in week one.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <ROICalculator />
        <Pricing />
        <WaitlistForm />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
