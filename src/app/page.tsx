import { Metadata } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { HeroSection, FeaturedStoresSection } from "@/components/landing";
import { Store } from "@/types/stores";
import { BodyResponse } from "@/types/response";
import { ContactInfo } from "@/types/stores";

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
  const storesData: BodyResponse<Store[]> = await storesResponse.json();

  // Get first 3 verified stores for featured section
  const featuredStores = storesData.status === 'success' && storesData.data
    ? storesData.data
      .filter((store: Store) => store.isVerified)
      .slice(0, 3)
      .map((store: Store) => ({
        id: store.id,
        storeName: store.storeName,
        isVerified: store.isVerified,
        imageUrl: store.imageUrl,
        description: store.description,
        contactInfo: store.contactInfo,
        userId: store.userId,
        bankAccount: store.bankAccount,
        isBanned: store.isBanned,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt
      }))
    : [];

  return (
    <>
      {/* Hero Section */}
      <HeroSection session={session} />

      {/* Featured Stores Section */}
      <FeaturedStoresSection featuredStores={featuredStores} />

      {/* Remaining sections would be similarly updated */}
    </>
  );
} 