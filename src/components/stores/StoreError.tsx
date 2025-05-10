"use client";

import { Button } from "@/components/ui/button";

interface StoreErrorProps {
  message: string;
  onRetry: () => void;
}

export default function StoreError({ message, onRetry }: StoreErrorProps) {
  return (
    <div className="py-8 text-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-semibold text-red-600 mb-2">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <Button onClick={onRetry}>ลองใหม่อีกครั้ง</Button>
      </div>
    </div>
  );
} 