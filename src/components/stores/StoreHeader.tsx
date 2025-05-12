"use client";

import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@/components/ui/input";

interface StoreHeaderProps {
  title: ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
}

export default function StoreHeader({ 
  title, 
  searchQuery = "", 
  onSearchChange,
  isLoading = false
}: StoreHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FontAwesomeIcon 
          icon={faMagnifyingGlass} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
        />
        <Input
          type="text"
          placeholder="ค้นหาร้านค้า..."
          value={searchQuery}
          onChange={(e) => {
            if (onSearchChange) {
              onSearchChange(e.target.value);
            }
          }}
          disabled={isLoading}
          className={`pl-10 w-full ${isLoading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
}
