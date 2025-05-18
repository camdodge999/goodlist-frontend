import React from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { Store } from '@/types/stores';

interface ProfileStoresProps {
  stores: Store[];
}

interface StoreWithContactInfo extends Store {
  contact_info: string; // JSON string that will be parsed
}

const ProfileStores: React.FC<ProfileStoresProps> = ({ stores }) => {
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
              } else if (store.contactInfo) {
                contactInfo = store.contactInfo;
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
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={
                            store.imageStore ||
                            "/images/logo.webp"
                          }
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
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          store.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {store.isVerified
                          ? "ผ่านการตรวจสอบ"
                          : "รอการตรวจสอบ"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default ProfileStores; 