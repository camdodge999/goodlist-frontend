import React from 'react';
import { motion } from 'framer-motion';
import { Store } from '@/types/stores';
import AuthenticatedImage from '@/components/ui/AuthenticatedImage';
import { isValidJSON } from '@/utils/valid-json';
import { getStoreStatus } from '@/lib/store-checker';
import defaultImage from '@images/logo.webp';

interface StoreItemProps {
  store: Store;
  onOpenStoreDetails: (store: Store) => void;
}

const StoreItem: React.FC<StoreItemProps> = ({ store, onOpenStoreDetails }) => {

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
        onClick={() => onOpenStoreDetails(store)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
              <AuthenticatedImage
                src={store.imageStore}
                alt={`รูปภาพร้าน ${store.storeName}`}
                fill
                className="object-cover"
                sizes="64px"
                fallbackSrc={defaultImage.src}
              />
            </div>
            <div className="ml-4">
              <span className="text-lg font-medium text-gray-900">
                {store.storeName}
              </span>
              <span className="text-sm text-gray-500">
                {contactInfo.line}
              </span>
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
};

export default StoreItem; 