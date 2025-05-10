"use client";

import StoreCard from "@/components/ui/StoreCard";
import type { Store } from "@/types/stores";

interface StoreGridProps {
  stores: Store[];
}

export default function StoreGrid({ stores }: StoreGridProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">ไม่พบร้านค้าตามเงื่อนไขที่เลือก</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stores.map((store: Store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
} 