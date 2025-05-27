import { StoreProvider } from "@/contexts/StoreContext";
import StoreDetailClientWithContext from "@/components/store/StoreDetailClientWithContext";

//interface StoreDetailPageProps {
//   params: {
//     id: string;
//   };
// }

export default async function StoreDetailPage() {
  // Return the client component wrapped in StoreProvider
  return (
    <StoreProvider>
      <StoreDetailClientWithContext />
    </StoreProvider>
  );
} 