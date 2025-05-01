"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StoreRequest } from "@/types/stores";
import type { Report } from "@/types/report";

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
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDateString = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Store Requests</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="requests" className="space-y-4">
          {storeRequests.length === 0 ? (
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
          ) : (
            storeRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{request.storeName}</CardTitle>
                      <CardDescription>
                        Submitted on{" "}
                        {formatDateString(request.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        request.status === "approved"
                          ? "outline"
                          : request.status === "rejected"
                          ? "destructive"
                          : "default"
                      }
                      className={
                        request.status === "approved" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : ""
                      }
                    >
                      {request.status === "approved" && (
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1 h-3 w-3" />
                      )}
                      {request.status === "rejected" && (
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-1 h-3 w-3" />
                      )}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Contact Information:</p>
                      <div>
                        {JSON.parse(request.documentUrls).map(
                            (url: string, index: number) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Document {index + 1}
                              </a>
                            )
                          )}
                          </div>
                    </div>
                    {request.rejectionReason && (
                      <div>
                        <p className="font-medium">Rejection Reason:</p>
                        <p className="text-red-500">
                          {request.rejectionReason}
                        </p>
                      </div>
                    )}
                    {request.documentUrls && (
                      <div>
                        <p className="font-medium">Submitted Documents:</p>
                        <div className="flex gap-2 mt-2">
                          {JSON.parse(request.documentUrls).map(
                            (url: string, index: number) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Document {index + 1}
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-lg mb-4">No reports submitted yet</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Report #{report.id}</CardTitle>
                      <CardDescription>
                        Store: {report.store?.storeName}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        report.status === "valid"
                          ? "outline"
                          : report.status === "invalid"
                          ? "destructive"
                          : "default"
                      }
                      className={
                        report.status === "valid" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : ""
                      }
                    >
                      {report.status === "valid" && (
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-1 h-3 w-3" />
                      )}
                      {report.status === "invalid" && (
                        <FontAwesomeIcon icon={faTimesCircle} className="mr-1 h-3 w-3" />
                      )}
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Reason:</p>
                      <p>{report.reason}</p>
                    </div>
                    {report.evidenceUrls && (
                      <div>
                        <p className="font-medium">Submitted Evidence:</p>
                        <div className="flex gap-2 mt-2">
                          {JSON.parse(report.evidenceUrls).map(
                            (url: string, index: number) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                View Evidence {index + 1}
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 