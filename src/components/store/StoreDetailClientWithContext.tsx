"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/contexts/StoreContext";
import { Store, ContactInfo } from "@/types/stores";
import { Skeleton } from "@/components/ui/skeleton";
import { isValidJSON } from "@/utils/valid-json";

export default function StoreDetailClientWithContext() {
  const params = useParams();
  const { getStoreById, isLoading, error } = useStore();
  const [store, setStore] = useState<Store | null>(null);
  
  useEffect(() => {
    async function fetchStoreData() {
      if (params.id) {
        // Ensure params.id is treated as a single string
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        const storeData = await getStoreById(id);
        if (storeData) {
          setStore(storeData);
        }
      }
    }
    
    fetchStoreData();
  }, [params.id, getStoreById]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500">Error loading store: {error}</div>;
  }
  
  if (!store) {
    return <div>Store not found</div>;
  }
  
  // Parse contactInfo if it's a string and valid JSON
  let parsedContactInfo: ContactInfo | string = store.contactInfo;
  if (typeof store.contactInfo === 'string') {
    if (isValidJSON(store.contactInfo)) {
      try {
        parsedContactInfo = JSON.parse(store.contactInfo) as ContactInfo;
      } catch (error) {
        console.error("Error parsing contact info:", error);
        // Keep as string if parsing fails
      }
    }
    // If not valid JSON, keep as string
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{store.storeName}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Store Details</h2>
          <p>{store.description}</p>
          
          {store.isVerified && (
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Verified
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
          {typeof parsedContactInfo === 'string' ? (
            <pre className="whitespace-pre-wrap">{parsedContactInfo}</pre>
          ) : (
            <div className="space-y-2">
              {parsedContactInfo.line && <p>Line: {parsedContactInfo.line}</p>}
              {parsedContactInfo.facebook && <p>Facebook: {parsedContactInfo.facebook}</p>}
              {parsedContactInfo.phone && <p>Phone: {parsedContactInfo.phone}</p>}
              {parsedContactInfo.address && <p>Address: {parsedContactInfo.address}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 