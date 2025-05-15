import { StoreProvider } from "@/contexts/StoreContext";
import StoreDetailClientWithContext from "@/components/store/StoreDetailClientWithContext";

interface StoreDetailPageProps {
  params: {
    id: string;
  };
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  // Ensure params is awaited before use
  const { id } = await Promise.resolve(params);
  
  // Return the client component wrapped in StoreProvider
  return (
    <StoreProvider>
      <StoreDetailClientWithContext />
    </StoreProvider>
  );
} 