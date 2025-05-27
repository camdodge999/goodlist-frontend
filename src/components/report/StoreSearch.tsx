"use client";

import React from "react";
import Image from "next/image";
import { DropdownFilter } from "@/components/ui/dropdown-filter";
import defaultLogo from "@images/logo.webp";
import { Store } from "@/types/stores";

interface StoreSearchProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
  validationError?: string;
}

export default function StoreSearch({
  stores,
  selectedStore,
  onSelectStore,
  validationError
}: StoreSearchProps) {
  // Filter function for stores
  const filterStore = (store: Store, query: string) => {
    if (!query.trim()) return true; // Show all when empty
    
    const searchLower = query.toLowerCase();
    const nameMatch = store.storeName.toLowerCase().includes(searchLower);
    const lineMatch = typeof store.contactInfo === 'object' && store.contactInfo?.line ? 
      store.contactInfo.line.toLowerCase().includes(searchLower) : 
      false;
    return (nameMatch || lineMatch) && (store.isVerified === true) && !store.isBanned;
  };

  // Render function for store items
  const renderStoreItem = (store: Store, isHighlighted: boolean, isSelected: boolean) => (
    <div className={`flex items-center gap-3 ${isSelected ? "bg-blue-50" : isHighlighted ? "bg-gray-100" : "hover:bg-gray-50"}`}>
      <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={store.imageUrl || "/images/logo.webp"}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.srcset = defaultLogo.src;
          }}
          alt={store.storeName}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {store.storeName}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {typeof store.contactInfo === 'object' ? store.contactInfo?.line : ''}
        </p>
      </div>
      {store.isVerified && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            ยืนยันแล้ว
          </span>
        </div>
      )}
    </div>
  );

  // Display the store name in the input when selected
  const displaySelectedLabel = (store: Store) => {
    return store.storeName;
  };

  return (
    <DropdownFilter
      items={stores}
      selectedItem={selectedStore}
      onSelectItem={onSelectStore}
      filterFunction={filterStore}
      renderItem={renderStoreItem}
      getItemId={(store) => store.id}
      placeholder="พิมพ์ชื่อร้านค้า หรือ Line ID..."
      validationError={validationError}
      noResultsMessage="ไม่พบร้านค้าที่ค้นหา"
      displaySelectedLabel={displaySelectedLabel}
    />
  );
} 