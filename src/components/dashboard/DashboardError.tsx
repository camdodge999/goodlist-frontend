"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface DashboardErrorProps {
  error: string;
}

export default function DashboardError({ error }: DashboardErrorProps) {
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