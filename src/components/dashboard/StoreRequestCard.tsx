"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StoreRequest } from "@/types/stores";
import { formatDate } from "@/lib/utils";

interface StoreRequestCardProps {
  request: StoreRequest;
}

export default function StoreRequestCard({ request }: StoreRequestCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{request.storeName}</CardTitle>
            <CardDescription>
              <span className="font-bold">Submitted on:</span>{" "}
              {formatDate(request.createdAt)}
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
  );
} 