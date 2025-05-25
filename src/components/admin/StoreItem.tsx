import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle,
  faExclamationTriangle,
  faHammer,
  faFileAlt,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import { Store } from "@/types/stores";
import { Report } from "@/types/report";
import defaultLogo from "@images/logo.webp";
import { isValidJSON } from "@/utils/valid-json";
import { getAuthenticatedImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

interface StoreItemProps {
  store: Store;
  activeTab: string;
  reports?: Report[];
  onViewStore: (store: Store) => void;
  onViewReport: (report: Report) => void;
  onApproveStore: (storeId: number) => void;
  onRejectStore: (storeId: number) => void;
  onBanStore: (storeId: number) => void;
  onUnbanStore: (storeId: number) => void;
  onUpdateReportStatus?: (reportId: string, newStatus: "valid" | "invalid") => void;
}

export default function StoreItem({
  store,
  reports = [],
  onViewStore,
  onViewReport,
  onApproveStore,
  onRejectStore,
  onBanStore,
  onUnbanStore,
  onUpdateReportStatus
}: StoreItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if store has additional property (might be custom field)
  const isAdditionalStore = store.userId > 0 && store.isVerified === null && !store.isBanned;
  
  // Filter reports for this store
  const storeReports = reports.filter(report => report.storeId === store.id);
  const hasReports = storeReports.length > 0;

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleReportClick = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    onViewReport(report);
  };

  const handleReportStatusUpdate = (e: React.MouseEvent, reportId: string, newStatus: "valid" | "invalid") => {
    e.stopPropagation();
    if (onUpdateReportStatus) {
      onUpdateReportStatus(reportId, newStatus);
    }
  };

  return (
    <div className="border-b border-gray-200">
      {/* Store Header */}
      <div className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50" onClick={() => onViewStore(store)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <Image 
                src={getAuthenticatedImageUrl(store.imageStore) || "/images/logo.webp"}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.srcset = defaultLogo.src;
                }}
                alt={store.storeName}
                fill
                className="object-cover"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onViewStore(store)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {store.storeName}
                </button>
                {hasReports && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                    {storeReports.length} รายงาน
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {typeof store.contactInfo === 'string' && isValidJSON(store.contactInfo)
                  ? JSON.parse(store.contactInfo).line 
                  : typeof store.contactInfo !== 'string' ? store.contactInfo?.line : ''}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {isAdditionalStore && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    คำขอเพิ่มร้านค้า
                  </span>
                )}
                {store.isVerified === true && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                    ผ่านการตรวจสอบ
                  </Badge>
                )}
                {store.isVerified === false && !store.isBanned && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                    ไม่ผ่านการตรวจสอบ
                  </Badge>
                )}
                {store.isBanned && (
                  <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
                    <FontAwesomeIcon icon={faHammer} className="w-3 h-3 mr-1" />
                    ถูกแบน
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
            {/* Expand/Collapse button for reports */}
            {hasReports && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleExpanded}
                className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200"
              >
                <FontAwesomeIcon 
                  icon={isExpanded ? faChevronUp : faChevronDown} 
                  className="w-4 h-4 mr-1" 
                />
                <span className="hidden sm:inline">
                  {isExpanded ? 'ซ่อน' : 'ดู'}รายงาน
                </span>
              </Button>
            )}
            
            {/* Store action buttons */}
            {store.isVerified === null && !store.isBanned && (
              <>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApproveStore(store.id);
                  }}
                  className="bg-green-600 text-white hover:bg-green-700 border-green-600"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">อนุมัติ</span>  
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRejectStore(store.id);
                  }}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600"   
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">ปฏิเสธ</span>
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBanStore(store.id);
                  }}
                  className="bg-slate-600 text-white hover:bg-slate-700 border-slate-600"
                >
                  <FontAwesomeIcon icon={faHammer} className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">แบน</span>
                </Button>
              </>
            )}
            {store.isVerified === true && !store.isBanned && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onBanStore(store.id);
                }}
                className="bg-slate-600 text-white hover:bg-slate-700 border-slate-600"
                >
                  <FontAwesomeIcon icon={faHammer} className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">แบน</span>
                </Button>
            )}
            {store.isBanned && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnbanStore(store.id);
                }}
                className="bg-green-600 text-white hover:bg-green-700 border-green-600"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">ยกเลิกแบน</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Subheader (Expandable) */}
      {hasReports && isExpanded && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="px-4 py-3 sm:px-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              รายงานทั้งหมด ({storeReports.length})
            </h4>
            <div className="space-y-2">
              {storeReports.map((report) => (
                <div 
                  key={report.id} 
                  className="bg-white p-3 rounded-md border border-gray-200 hover:border-gray-300 cursor-pointer"
                  onClick={(e) => handleReportClick(e, report)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          รายงาน #{report.id}
                        </span>
                        <div>
                          {report.status === "pending" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              รอดำเนินการ
                            </span>
                          ) : report.status === "reviewed" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                              ยืนยันแล้ว
                            </span>
                          ) : report.status === "rejected" ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                              ปฏิเสธ
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                              ไม่ถูกต้อง
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{report.reason}</p>
                      <p className="text-xs text-gray-500">
                        {dayjs(report.createdAt).format('DD MMM BBBB เวลา HH:mm น.')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleReportClick(e, report)}
                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                      >
                        <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">ดูรายละเอียด</span>
                      </Button>
                      
                      {report.status === "pending" && onUpdateReportStatus && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => handleReportStatusUpdate(e, report.id, "invalid")}
                            className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                          >
                            <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                            <span className="hidden sm:inline">ปฏิเสธ</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 