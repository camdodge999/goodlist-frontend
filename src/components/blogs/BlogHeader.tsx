"use client";

import { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlogHeaderProps {
  title: ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export default function BlogHeader({ 
  title, 
  searchQuery = "", 
  onSearchChange,
  isLoading = false,
  isRefreshing = false,
  onRefresh
}: BlogHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>
        
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing || isLoading}
            className="ml-4"
          >
            <FontAwesomeIcon 
              icon={faArrowsRotate} 
              className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {isRefreshing ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FontAwesomeIcon 
          icon={faMagnifyingGlass} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" 
        />
        <Input
          type="text"
          placeholder="ค้นหาบทความ..."
          value={searchQuery}
          onChange={(e) => {
            if (onSearchChange) {
              onSearchChange(e.target.value);
            }
          }}
          disabled={isLoading || isRefreshing}
          className={`pl-10 w-full ${(isLoading || isRefreshing) ? 'bg-gray-50 cursor-not-allowed' : ''}`}
        />
      </div>
    </div>
  );
} 