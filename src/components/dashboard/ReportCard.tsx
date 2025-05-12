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
import type { Report } from "@/types/report";

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <Card>
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
  );
} 