"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Store, User, StoreAudit, ContactInfo } from "@/types/stores";
import { Button } from "@/components/ui/button";
import StoreHeader from "./StoreHeader";
import StoreDescription from "./StoreDescription";
import ContactInfoCard from "./ContactInfoCard";
import AdditionalInfoCard from "./AdditionalInfoCard";
import ReportDialog from "./ReportDialog";
import { getCurrentUser } from "@/lib/api/users";

interface StoreDetailClientProps {
  store: Store;
  storeOwner: User;
  verificationAudit?: StoreAudit;
}

export default function StoreDetailClient({ 
  store
}: StoreDetailClientProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [authState, setAuthState] = useState<{ isLoggedIn: boolean; user: User | null }>({
    isLoggedIn: false,
    user: null
  });

  // Fetch auth state on component mount
  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const result = await getCurrentUser();
        setAuthState(result);
      } catch (error) {
        console.error("Error fetching auth state:", error);
      }
    };
    
    fetchAuth();
  }, []);

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                isLoggedIn={authState.isLoggedIn}
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
                รายงานร้านค้า
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