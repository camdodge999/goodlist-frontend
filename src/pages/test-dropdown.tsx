import React, { useState } from 'react';
import StoreSearch from '@/components/report/StoreSearch';
import { Store } from '@/types/stores';

// Mock data for testing
const mockStores: Store[] = [
  {
    id: 1,
    userId: 1,
    email: "store1@example.com",
    storeName: "Store One",
    displayName: "Store One Display",
    bankAccount: "123456789",
    contactInfo: { line: "store1_line", facebook: "store1_fb" },
    description: "A description for store one",
    isVerified: true,
    isBanned: false,
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    imageStore: "",
    certIncrop: "",
    imageIdCard: "",
    imageUrl: "/images/logo.webp"
  },
  {
    id: 2,
    userId: 2,
    email: "store2@example.com",
    storeName: "Store Two",
    displayName: "Store Two Display",
    bankAccount: "987654321",
    contactInfo: { line: "store2_line", facebook: "store2_fb" },
    description: "A description for store two",
    isVerified: true,
    isBanned: false,
    createdAt: "2023-01-02",
    updatedAt: "2023-01-02",
    imageStore: "",
    certIncrop: "",
    imageIdCard: "",
    imageUrl: "/images/logo.webp"
  }
];

export default function TestDropdown() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Dropdown Filter</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select a Store
        </label>
        <StoreSearch 
          stores={mockStores}
          selectedStore={selectedStore}
          onSelectStore={(store) => {
            console.log('Selected store:', store);
            setSelectedStore(store);
          }}
        />
      </div>
      
      {selectedStore && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold">Selected Store:</h2>
          <p>Name: {selectedStore.storeName}</p>
          <p>Line: {typeof selectedStore.contactInfo === 'object' ? selectedStore.contactInfo.line : ''}</p>
        </div>
      )}
    </div>
  );
} 