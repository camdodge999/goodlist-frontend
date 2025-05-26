import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@/types/stores';
import StoreDetailDialog from '@/components/store/StoreDetailDialog';
import StoreItem from '@/components/profile/StoreItem';

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
          <li className="px-4 py-8 text-center">
            <FontAwesomeIcon icon={faStore} className="h-12 w-12 text-gray-300 mx-auto" />
            <span className="mt-2 text-sm font-medium text-gray-900">ไม่มีร้านค้า</span>
            <span  className="mt-1 text-sm text-gray-500">คุณยังไม่มีร้านค้า</span>
          </li>
        ) : (
          stores.map((store) => (
            <StoreItem
              key={store.id}
              store={store}
              onOpenStoreDetails={handleOpenStoreDetails}
            />
          ))
        )}
      </ul>

      {/* Store Detail Dialog */}
      <StoreDetailDialog 
        store={selectedStore} 
        isOpen={showStoreDetails} 
        onClose={handleCloseStoreDetails}
        hideAdminActions={true} 
      />
    </div>
  );
};

export default ProfileStores; 