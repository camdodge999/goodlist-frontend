"use client";

import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

interface StoreSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function StoreSearch({ searchQuery, setSearchQuery }: StoreSearchProps) {
  return (
    <div className="relative">
      <FontAwesomeIcon 
        icon={faMagnifyingGlass} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
      />
      <Input
        type="text"
        placeholder="ค้นหาร้านค้า..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
} 