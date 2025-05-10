import { Metadata } from 'next';
import StoresPage from "@/components/pages/StoresPage";
import { StoreProvider } from "@/contexts/StoreContext";
import { Store } from "@/types/stores";

export const metadata: Metadata = {
  title: 'ร้านค้าที่ผ่านการตรวจสอบ | Goodlistseller',
  description: 'ค้นหาร้านค้าออนไลน์ที่ผ่านการตรวจสอบและไว้ใจได้',
};

export default async function Page() {
  // Fetch stores from API
  const storesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }, // Revalidate at most once per minute
    }
  );

  // Parse the JSON response
  const storesData = await storesResponse.json();

  // Get stores from the response
  const stores: Store[] = storesData.statusCode === 200 && storesData.data ? storesData.data : [];

  return (
    <StoreProvider initialStores={stores}>
      <StoresPage />
    </StoreProvider>
  );
} 