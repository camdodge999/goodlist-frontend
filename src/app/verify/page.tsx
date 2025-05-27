import { UserProvider } from "@/contexts/UserContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { metadataPages } from "@/consts/metadata";
import VerifyPageClient from "./VerifyPageClient";

// Metadata - properly handled in server component
export const metadata = {
  title: metadataPages.verify.title,
  description: metadataPages.verify.description,
};

// Server component that wraps the client component with providers
export default function VerifyPage() {
  return (
    <StoreProvider>
      <UserProvider>
        <VerifyPageClient />
      </UserProvider>
    </StoreProvider>
  );
} 