import React, { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { Store } from '@/types/stores';
import { getAuthenticatedImageUrl } from '@/lib/utils';
import defaultImage from '@images/logo.webp';
import StoreDetailDialog from '@/components/store/StoreDetailDialog';

interface ProfileStoresProps {
  stores: Store[];
}

interface StoreWithContactInfo extends Store {
  contact_info: string; // JSON string that will be parsed
}

const ProfileStores: React.FC<ProfileStoresProps> = ({ stores }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);

  const handleOpenStoreDetails = (store: Store) => {
    setSelectedStore(store);
    setShowStoreDetails(true);
  };

  const handleCloseStoreDetails = () => {
    setShowStoreDetails(false);
  };

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
            
            try {
              if (typeof (store as StoreWithContactInfo).contact_info === 'string') {
                contactInfo = JSON.parse((store as StoreWithContactInfo).contact_info);
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
            
            // Determine the verification status and styling
            let statusClass = "";
            let statusText = "";
            
            if (store.isVerified === true) {
              statusClass = "bg-green-100 text-green-800";
              statusText = "ผ่านการตรวจสอบ";
            } else if (store.isVerified === false) {
              statusClass = "bg-red-100 text-red-800";
              statusText = "ไม่ผ่านการตรวจสอบ";
            } else {
              // For null or undefined cases
              statusClass = "bg-yellow-100 text-yellow-800";
              statusText = "รอการตรวจสอบ";
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