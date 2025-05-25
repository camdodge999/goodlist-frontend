"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye } from 'lucide-react';    
import { Report } from '@/types/report';
import { getAuthenticatedImageUrl } from '@/lib/utils';
import defaultImage from '@images/logo.webp';
import DocumentPreviewDialog from './DocumentPreviewDialog';
import { Button } from '../ui/button';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from "dayjs/plugin/buddhistEra"
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle,
  faFileAlt,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

dayjs.locale('th');
dayjs.extend(buddhistEra);

interface ReportDetailDialogProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (reportId: string, newStatus: "valid" | "invalid") => Promise<void>;
  onBanStore?: (storeId: string) => void;
  hideAdminActions?: boolean;
}

const ReportDetailDialog: React.FC<ReportDetailDialogProps> = ({ 
  report, 
  isOpen, 
  onClose, 
  onUpdateStatus, 
  onBanStore, 
  hideAdminActions = false 
}) => {
  const [previewImage, setPreviewImage] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
  }>({
    isOpen: false,
    url: '',
    name: '',
  });

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" && !hideAdminActions;

  if (!report) return null;

  // Determine status styling
  let statusColor = "";
  let statusIcon = null;
  let statusText = "";

  switch (report.status) {
    case "pending":
      statusColor = "text-yellow-600";
      statusIcon = faExclamationTriangle;
      statusText = "รอดำเนินการ";
      break;
    case "reviewed":
      statusColor = "text-green-600";
      statusIcon = faCheckCircle;
      statusText = "ยืนยันแล้ว";
      break;
    case "rejected":
      statusColor = "text-red-600";
      statusIcon = faTimesCircle;
      statusText = "ปฏิเสธ";
      break;
    case "invalid":
      statusColor = "text-blue-600";
      statusIcon = faFileAlt;
      statusText = "ไม่ถูกต้อง";
      break;  
    default:
      statusColor = "text-yellow-600";
      statusIcon = faExclamationTriangle;
      statusText = "รอดำเนินการ";
  }

  // Handle evidence view or download
  const handleEvidenceAction = () => {
    const evidenceUrl = getAuthenticatedImageUrl(report.evidenceUrl);

    if (!evidenceUrl) return;

    // Check if it's an image file
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(report.evidenceUrl);
    
    if (isImage) {
      setPreviewImage({
        isOpen: true,
        url: evidenceUrl,
        name: 'หลักฐานการรายงาน'
      });
    } else {
      // For non-image files, trigger download
      const link = document.createElement('a');
      link.href = evidenceUrl;
      link.download = `evidence_${report.id}.${report.evidenceUrl.split('.').pop()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Close the preview dialog
  const handleClosePreview = () => {
    setPreviewImage({
      isOpen: false,
      url: '',
      name: '',
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl p-0 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
            <DialogTitle className="text-xl font-medium">รายละเอียดรายงาน</DialogTitle>
          </DialogHeader>

          <div className="p-6">
            {/* Report Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">รายงาน #{report.id}</h3>
                <div className={`flex items-center ${statusColor}`}>
                  {statusIcon && <FontAwesomeIcon icon={statusIcon} className="w-4 h-4 mr-2" />}
                  <span className="font-medium">{statusText}</span>
                </div>
              </div>
              
              {report.store && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm text-gray-500">ร้านค้าที่ถูกรายงาน</div>
                  <div className="font-medium text-lg">{report.store.storeName}</div>
                </div>
              )}
            </div>

            {/* Report Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">รายละเอียดการรายงาน</h3>
              <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-md">
                <div>
                  <div className="text-sm text-gray-500">เหตุผลการรายงาน</div>
                  <div className="font-medium mt-1">{report.reason}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">วันที่รายงาน</div>
                  <div className="font-medium">{dayjs(report.createdAt).format('DD MMMM BBBB เวลา HH:mm น.')}</div>
                </div>
              </div>
            </div>

            {/* Evidence Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">หลักฐานประกอบ</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                {report.evidenceUrl ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">ไฟล์หลักฐาน</div>
                      <div className="font-medium">หลักฐานการรายงาน</div>
                    </div>
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center cursor-pointer"
                      onClick={handleEvidenceAction}
                    >
                      {/\.(jpg|jpeg|png|gif|webp)$/i.test(report.evidenceUrl) ? (
                        <>
                          <Eye size={16} className="mr-1" />
                          <span>ดูหลักฐาน</span>
                        </>
                      ) : (
                        <>
                          <Download size={16} className="mr-1" />
                          <span>ดาวน์โหลด</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">
                    ไม่มีหลักฐานประกอบ
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex justify-end gap-2">
            <Button
              variant="primary"
              onClick={onClose}
            >
              ปิด
            </Button>
            
            {/* Admin-only actions */}
            {isAdmin && report.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={async () => onUpdateStatus && await onUpdateStatus(report.id, "valid")}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                  ยืนยัน
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={async () => onUpdateStatus && await onUpdateStatus(report.id, "invalid")}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                  ปฏิเสธ
                </Button>
              </>
            )}
            
            {isAdmin && onBanStore && (
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => onBanStore(report.storeId.toString())}
              >
                แบนร้านค้า
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Evidence Preview Dialog */}
      <DocumentPreviewDialog
        isOpen={previewImage.isOpen}
        onClose={handleClosePreview}
        imageUrl={previewImage.url}
        documentName={previewImage.name}
      />
    </>
  );
};

export default ReportDetailDialog; 