import React, { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { Store } from '@/types/stores';
import { getAuthenticatedImageUrl } from '@/lib/utils';
import defaultImage from '@images/logo.webp';
import StoreDetailDialog from '@/components/store/StoreDetailDialog';
import { isValidJSON } from '@/utils/valid-json';
import { getStoreStatus } from '@/lib/store-checker';

interface ProfileStoresProps {
  stores: Store[];
  isLoading?: boolean;
}

const ProfileStores: React.FC<ProfileStoresProps> = ({ stores, isLoading = false }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);

  const handleOpenStoreDetails = (store: Store) => {
    setSelectedStore(store);
    setShowStoreDetails(true);
  };

  const handleCloseStoreDetails = () => {
    setShowStoreDetails(false);
  };

  // Skeleton loading component
  const StoreSkeleton = () => (
    <div className="px-4 py-4 sm:px-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-lg bg-gray-200 flex-shrink-0"></div>
          <div className="ml-4">
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <div className="h-5 w-20 bg-gray-200 rounded-full px-2.5 py-0.5"></div>
        </div>
      </div>
    </div>
  );

  // Display skeletons when loading
  if (isLoading) {
    return (
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <ul role="list" className="divide-y divide-gray-200">
          {[...Array(3)].map((_, index) => (
            <li key={`skeleton-${index}`}>
              <StoreSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <ul role="list" className="divide-y divide-gray-200">
        {stores.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <FontAwesomeIcon icon={faStore} className="h-12 w-12 text-gray-300 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">ไม่มีร้านค้า</h3>
            <p className="mt-1 text-sm text-gray-500">คุณยังไม่มีร้านค้า</p>
          </div>
        ) : (
          stores.map((store) => {
            // Parse contact info
            let contactInfo = {
              line: "",
              facebook: "",
              phone: "",
              address: "",
            };

            const isValid = isValidJSON(store.contactInfo as string);
            const { statusClass, statusText } = getStoreStatus(store.isVerified);

            try {
              if (isValid) {
                contactInfo = JSON.parse(store.contactInfo as string);
              } else if (store.contactInfo && typeof store.contactInfo !== 'string') {
                // Handle potential undefined properties in contactInfo
                contactInfo = {
                  line: store.contactInfo.line || "",
                  facebook: store.contactInfo.facebook || "",
                  phone: store.contactInfo.phone || "",
                  address: store.contactInfo.address || "",
                };
              }
            } catch (error) {
              console.error("Error parsing contact info:", error);
            }
          
            return (
              <motion.li
                key={store.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleOpenStoreDetails(store)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            getAuthenticatedImageUrl(store.imageStore) ||
                            "/images/logo.webp"
                          }
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.srcset = defaultImage.src;
                          }}
                          alt={`รูปภาพร้าน ${store.storeName}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {store.storeName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {contactInfo.line}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}
                      >
                        {statusText}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })
        )}
      </ul>

      {/* Store Detail Dialog */}
      <StoreDetailDialog 
        store={selectedStore} 
        isOpen={showStoreDetails} 
        onClose={handleCloseStoreDetails} 
      />
    </div>
  );
};

export default ProfileStores; 