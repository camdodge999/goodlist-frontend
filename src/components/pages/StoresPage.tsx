"use client";

import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/contexts/StoreContext";
import StoreCard from "@/components/ui/StoreCard";
import type { Store } from "@/types/stores";

export default function StoresPage() {
  const { stores, isLoading } = useStore() as { 
    stores: Store[]; 
    isLoading: boolean 
  };
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 6;

  // Filter stores based on search query and verification status
  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase());
    const isVerified = store.isVerified;
    return matchesSearch && isVerified;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredStores.length / storesPerPage);
  const startIndex = (currentPage - 1) * storesPerPage;
  const endIndex = startIndex + storesPerPage;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              ร้านค้าที่ผ่านการตรวจสอบ
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
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">ไม่พบร้านค้าตามเงื่อนไขที่เลือก</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ก่อนหน้า
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              ถัดไป
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 