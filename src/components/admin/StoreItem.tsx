import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle,
  faHammer,
  faFileAlt,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Store } from "@/types/stores";
import { Report } from "@/types/report";
import { isValidJSON } from "@/utils/valid-json";
import StoreItemImage from "@/components/admin/StoreItemImage";
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
    <Card className="mb-4 hover:shadow-md transition-shadow duration-200">
      {/* Store Header */}
      <CardHeader className="cursor-pointer" onClick={() => onViewStore(store)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center flex-1 min-w-0">
            <StoreItemImage 
              imageStore={store.imageStore}
              storeName={store.storeName}
            />
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <button
                  onClick={() => onViewStore(store)}
                  className="text-sm sm:text-base font-medium text-blue-600 hover:text-blue-800 text-left truncate"
                >
                  {store.storeName}
                </button>
                {hasReports && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 self-start sm:self-auto">
                    {storeReports.length} รายงาน
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {typeof store.contactInfo === 'string' && isValidJSON(store.contactInfo)
                  ? JSON.parse(store.contactInfo).line 
                  : typeof store.contactInfo !== 'string' ? store.contactInfo?.line : ''}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {isAdditionalStore && (
                  <span className="inline-flex items-center px-2 py-1 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    คำขอเพิ่มร้านค้า
                  </span>
                )}
                {store.isVerified === true && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">ผ่านการตรวจสอบ</span>
                    <span className="xs:hidden">ผ่าน</span>
                  </Badge>
                )}
                {store.isVerified === false && !store.isBanned && (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">ไม่ผ่านการตรวจสอบ</span>
                    <span className="xs:hidden">ไม่ผ่าน</span>
                  </Badge>
                )}
                {store.isBanned && (
                  <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
                    <FontAwesomeIcon icon={faHammer} className="w-3 h-3 mr-1" />
                    <span className="hidden xs:inline">ถูกแบน</span>
                    <span className="xs:hidden">แบน</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end sm:justify-start gap-1 sm:gap-2 sm:ml-2 sm:flex-shrink-0">
            {/* Expand/Collapse button for reports */}
            {hasReports && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleExpanded}
                className="bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200 px-2 sm:px-3"
              >
                <FontAwesomeIcon 
                  icon={isExpanded ? faChevronUp : faChevronDown} 
                  className="w-4 h-4 sm:mr-1" 
                />
                <span className="hidden sm:inline ml-1">
                  {isExpanded ? 'ซ่อน' : 'ดู'}รายงาน
                </span>
              </Button>
            )}
            
            {/* Store action buttons */}
            {store.isVerified === null && !store.isBanned && (
              <div className="flex gap-1 sm:gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApproveStore(store.id);
                  }}
                  className="bg-green-600 text-white hover:bg-green-700 border-green-600 px-2 sm:px-3"
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline ml-1">อนุมัติ</span>  
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRejectStore(store.id);
                  }}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600 px-2 sm:px-3"   
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline ml-1">ปฏิเสธ</span>
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBanStore(store.id);
                  }}
                  className="bg-slate-600 text-white hover:bg-slate-700 border-slate-600 px-2 sm:px-3"
                >
                  <FontAwesomeIcon icon={faHammer} className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline ml-1">แบน</span>
                </Button>
              </div>
            )}
            {store.isVerified === true && !store.isBanned && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onBanStore(store.id);
                }}
                className="bg-slate-600 text-white hover:bg-slate-700 border-slate-600 px-2 sm:px-3"
                >
                  <FontAwesomeIcon icon={faHammer} className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline ml-1">แบน</span>
                </Button>
            )}
            {store.isBanned && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnbanStore(store.id);
                }}
                className="bg-green-600 text-white hover:bg-green-700 border-green-600 px-2 sm:px-3"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline ml-1">ยกเลิกแบน</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Reports Subheader (Expandable) */}
      {hasReports && isExpanded && (
        <CardContent className="bg-gray-50 border-t pt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            รายงานทั้งหมด ({storeReports.length})
          </h4>
          <div className="space-y-3">
            {storeReports.map((report) => (
              <Card 
                key={report.id} 
                className="bg-white hover:shadow-sm cursor-pointer transition-shadow duration-200"
                onClick={(e) => handleReportClick(e, report)}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 mb-2">
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
                      <p className="text-sm text-gray-700 mb-1 line-clamp-2 sm:line-clamp-none">{report.reason}</p>
                      <p className="text-xs text-gray-500">
                        {dayjs(report.createdAt).format('DD MMM BBBB เวลา HH:mm น.')}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-end gap-1 sm:gap-2 sm:ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleReportClick(e, report)}
                        className="bg-blue-50 text-blue-600 hover:text-blue-800 hover:bg-blue-100 border-blue-200 px-2 sm:px-3"
                      >
                        <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline ml-1">ดูรายละเอียด</span>
                      </Button>
                      
                      {report.status === "pending" && onUpdateReportStatus && (
                        <Button
                          size="sm"
                          onClick={(e) => handleReportStatusUpdate(e, report.id, "invalid")}
                          className="bg-red-600 text-white hover:bg-red-700 border-red-600 px-2 sm:px-3"
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline ml-1">ปฏิเสธ</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 