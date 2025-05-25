import { Metadata } from 'next';
import StoresPage from "@/components/pages/StoresPage";
import { StoreProvider } from "@/contexts/StoreContext";
import { metadataPages } from "@/consts/metadata";  

export const metadata: Metadata = {
  title: metadataPages.stores.title,
  description: metadataPages.stores.description,
};


export default async function Page() {
  return (
    <StoreProvider>
      <StoresPage />
    </StoreProvider>
  );
} 