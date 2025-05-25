import { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Footer } from "@/components/layout/Footer";
import { HeroSection, WhyChooseSection, FeaturedStoresSection, StoreCheckerSection, SafetyTipsSection, GettingStartedSection } from "@/components/landing";
import { StoreProvider } from "@/contexts/StoreContext";    
import { metadataPages } from "@/consts/metadata";

export const metadata: Metadata = {
  title: metadataPages.main.title,
  description: metadataPages.main.description,
};

export default async function Home() {
  // Get the user session server-side
  const session = await getServerSession(authOptions);

  return (
    <StoreProvider>
      {/* Hero Section */}
      <HeroSection session={session} />

      {/* Why Choose Goodlistseller Section */}
      <WhyChooseSection />

      {/* Getting Started Section */}
      <GettingStartedSection />

      {/* Featured Stores Section */}
      <FeaturedStoresSection />

      {/* Store Checker Section */}
      <StoreCheckerSection />

      {/* Safety Tips and FAQ Section */}
      <SafetyTipsSection />

      {/* Footer with sitemap and contact info */}
      <Footer />
    </StoreProvider>
  );
} 