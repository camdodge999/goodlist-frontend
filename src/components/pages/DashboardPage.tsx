"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StoreRequest } from "@/types/stores";
import type { Report } from "@/types/report";

// Dashboard Components
import StoreRequestsList from "@/components/dashboard/StoreRequestsList";
import ReportsList from "@/components/dashboard/ReportsList";
import DashboardLoading from "@/components/dashboard/DashboardLoading";
import DashboardError from "@/components/dashboard/DashboardError";

interface DashboardPageProps {
  userId?: string;
  initialStoreRequests?: StoreRequest[];
  initialReports?: Report[];
}

export default function DashboardPage({ 
  userId,
  initialStoreRequests = [],
  initialReports = [] 
}: DashboardPageProps) {
  const [storeRequests, setStoreRequests] = useState<StoreRequest[]>(initialStoreRequests);
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isLoading, setIsLoading] = useState(!initialStoreRequests.length && !initialReports.length);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have data from SSR, skip fetching
    if (initialStoreRequests.length > 0 || initialReports.length > 0) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [requestsRes, reportsRes] = await Promise.all([
          fetch(`/api/store-requests?userId=${userId || ''}`),
          fetch(`/api/reports?reporterId=${userId || ''}`),
        ]);

        const requestsData = await requestsRes.json();
        const reportsData = await reportsRes.json();

        if (!requestsRes.ok || !reportsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        setStoreRequests(requestsData.data);
        setReports(reportsData.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, initialStoreRequests, initialReports]);

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (error) {
    return <DashboardError error={error} />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Store Requests</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="space-y-4">
          <StoreRequestsList 
            storeRequests={storeRequests} 
          />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <ReportsList reports={reports} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 