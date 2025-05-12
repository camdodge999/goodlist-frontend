"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StoreRequestCard from "./StoreRequestCard";
import type { StoreRequest } from "@/types/stores";

interface StoreRequestsListProps {
  storeRequests: StoreRequest[];
  formatDateString: (dateString: string) => string;
}

export default function StoreRequestsList({ 
  storeRequests, 
  formatDateString 
}: StoreRequestsListProps) {
  if (storeRequests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-lg mb-4">No store requests yet</p>
            <Link href="/store-requests/new">
              <Button>Create New Request</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {storeRequests.map((request) => (
        <StoreRequestCard 
          key={request.id} 
          request={request} 
          formatDateString={formatDateString} 
        />
      ))}
    </div>
  );
} 