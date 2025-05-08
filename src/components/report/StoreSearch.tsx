import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type ContactInfo = {
  line?: string;
  facebook?: string;
  phone?: string;
  address?: string;
};

type Store = {
  id: number;
  userId: number;
  storeName: string;
  contactInfo: ContactInfo;
  imageUrl?: string;
  isVerified: boolean;
  isBanned: boolean;
};

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter stores based on search query
  const filteredStores = stores.filter(
    (store) => {
      const nameMatch = store.storeName.toLowerCase().includes(searchQuery.toLowerCase());
      const lineMatch = store.contactInfo.line ? 
        store.contactInfo.line.toLowerCase().includes(searchQuery.toLowerCase()) : 
        false;
      return (nameMatch || lineMatch) && store.isVerified && !store.isBanned;
    }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update search query when a store is selected
  useEffect(() => {
    if (selectedStore) {
      setSearchQuery(selectedStore.storeName);
    }
  }, [selectedStore]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          className={cn("pr-10", validationError && "border-red-300 focus-visible:ring-red-500")}
          placeholder="พิมพ์ชื่อร้านค้า หรือ Line ID..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {validationError && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}

      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <div
                key={store.id}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50",
                  selectedStore?.id === store.id && "bg-blue-50"
                )}
                onClick={() => {
                  onSelectStore(store);
                  setIsDropdownOpen(false);
                }}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      store.imageUrl ||
                      "/images/stores/default-store.jpg"
                    }
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
                    {store.contactInfo.line}
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
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              ไม่พบร้านค้าที่ค้นหา
            </div>
          )}
        </div>
      )}
    </div>
  );
} 