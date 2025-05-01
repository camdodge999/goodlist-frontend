import { notFound } from "next/navigation";
import StoreDetailClient from "@/components/store/StoreDetailClient";
import { getStoreById } from "@/lib/api/stores";
import { getStoreAudits } from "@/lib/api/audits";
import { getUserById } from "@/lib/api/users";

interface StoreDetailPageProps {
  params: {
    id: string;
  };
}

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  // Convert storeId to number
  const storeId = parseInt(params.id, 10);
  
  // This would be your actual data fetching in production
  try {
    // Fetch store data
    const store = await getStoreById(storeId);
    
    if (!store) {
      notFound();
    }
    
    // Fetch store owner data
    const storeOwner = await getUserById(store.userId);
    
    if (!storeOwner) {
      notFound();
    }
    
    // Fetch store audits
    const storeAudits = await getStoreAudits(storeId);
    
    // Find verification audit
    const verificationAudit = storeAudits.find(
      (audit) => audit.action === "verified"
    );
    
    // Pass all data to client component
    return (
      <StoreDetailClient 
        store={store}
        storeOwner={storeOwner}
        verificationAudit={verificationAudit}
      />
    );
  } catch (error) {
    console.error("Error fetching store data:", error);
    return notFound();
  }
} 