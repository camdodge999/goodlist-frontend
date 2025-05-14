import { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Footer } from "@/components/layout/Footer";
import { HeroSection, FeaturedStoresSection, StoreCheckerSection, SafetyTipsSection } from "@/components/landing";
import { Store } from "@/types/stores";
import { StoreProvider } from "@/contexts/StoreContext";    

export const metadata: Metadata = {
  title: 'Goodlistseller - ร้านค้าออนไลน์ที่คุณไว้ใจได้',
  description: 'แพลตฟอร์มที่ช่วยให้คุณค้นหาร้านค้าออนไลน์ที่เชื่อถือได้ในประเทศไทย',
};

export default async function Home() {
  // Get the user session server-side
  const session = await getServerSession(authOptions);
  
  // Fetch stores from our API endpoint
  const storesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Adding cache options for better performance
      next: { revalidate: 60 }, // Revalidate at most once per minute
    }
  );

  // Parse the JSON response
  const storesData = await storesResponse.json();

  // Get stores from the response
  const stores: Store[] = storesData.statusCode === 200 && storesData.data ? storesData.data : [];

  // Get first 3 verified stores for featured section
  const featuredStores = stores
    .filter((store: Store) => store.isVerified)
    .slice(0, 3);

  return (
    <StoreProvider initialStores={stores}>
      {/* Hero Section */}
      <HeroSection session={session} />

      {/* Featured Stores Section */}
      <FeaturedStoresSection featuredStores={featuredStores} />

      {/* Store Checker Section */}
      <StoreCheckerSection />

      {/* Safety Tips and FAQ Section */}
      <SafetyTipsSection />

      {/* Footer with sitemap and contact info */}
      <Footer />
    </StoreProvider>
  );
} 