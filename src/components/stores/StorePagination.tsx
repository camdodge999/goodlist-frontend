"use client";

import { Button } from "@/components/ui/button";

interface StorePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function StorePagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: StorePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ก่อนหน้า
      </Button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className="min-w-[40px]"
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        ถัดไป
      </Button>
    </div>
  );
} 