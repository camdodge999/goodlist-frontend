"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/contexts/StoreContext";
import { Store, ContactInfo } from "@/types/stores";
import { isValidJSON } from "@/utils/valid-json";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import StoreHeader from "./StoreHeader";
import StoreDescription from "./StoreDescription";
import ContactInfoCard from "./ContactInfoCard";
import AdditionalInfoCard from "./AdditionalInfoCard";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import ReportDialog from "./ReportDialog";
import StoreDetailClientSkeleton from "./StoreDetailClientSkeleton";
import StoreNotFoundCard from "./StoreNotFoundCard";
import StoreErrorCard from "./StoreErrorCard";

export default function StoreDetailClientWithContext() {
  const params = useParams();
  const { getStoreById, isLoading, error } = useStore();
  const [store, setStore] = useState<Store | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const fetchStoreData = async () => {
    if (params?.id) {
      // Ensure params.id is treated as a single string
      const id = Array.isArray(params.id) ? params.id[0] : params.id;
      const storeData = await getStoreById(id);
      if (storeData) {
        setStore(storeData);
      } else {
        setStore(null);
      }
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [params?.id, getStoreById]);

  if (isLoading) {
    return (<StoreDetailClientSkeleton />)
  }

  if (!store) {
    return <StoreNotFoundCard />;
  }

  if (error) {
    return <StoreErrorCard error={error} onRetry={fetchStoreData} />;
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
    <div className="space-y-6 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">

        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/stores">ร้านค้า</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{store.storeName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>


        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          {/* Store Header */}
          <StoreHeader store={store} />

          {/* Store Description */}
          <StoreDescription description={store.description} />

          {/* Store Details */}
          <div className="border-t border-gray-200 px-6 py-5 sm:px-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Contact Information */}
              <ContactInfoCard
                contactInfo={store.contactInfo as ContactInfo}
                userEmail={store.email}
              />

              {/* Additional Information */}
              <AdditionalInfoCard
                createdAt={store.createdAt}
                bankAccount={store.bankAccount}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-5 sm:px-8 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                variant="destructive"
                className="gap-2"
                onClick={() => setIsReportDialogOpen(true)}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4" />
                <span>รายงานร้านค้า</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <ReportDialog
        isOpen={isReportDialogOpen}
        storeId={store.id}
        onOpenChange={setIsReportDialogOpen}
      />
    </div>
  );
} 