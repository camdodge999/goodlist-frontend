import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faFileAlt,
  faHammer
} from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Store } from "@/types/stores";
import { Report } from "@/types/report";

interface SelectedReport {
  store: Store;
  reports: Report[];
}

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReport: SelectedReport | null;
  onUpdateReportStatus: (reportId: string, newStatus: "valid" | "invalid") => void;
  onBanStore: (storeId: number) => void;
}

export default function ReportsModal({
  isOpen,
  onClose,
  selectedReport,
  onUpdateReportStatus,
  onBanStore
}: ReportsModalProps) {
  if (!selectedReport) return null;

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">รายงานร้านค้า</DialogTitle>
          <DialogDescription>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-medium">{selectedReport.store.storeName}</span>
              <span className="text-gray-500">·</span>
              <span>
                มีทั้งหมด {selectedReport.reports.length} รายงาน
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 space-y-6">
          {selectedReport.reports.map((report) => (
            <div key={report.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">
                  รายงานเมื่อ {formatDate(report.createdAt)}
                </span>
                <div>
                  {report.status === "pending" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      รอดำเนินการ
                    </span>
                  ) : report.status === "valid" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                      ยืนยันแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                      ไม่ถูกต้อง
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">เหตุผล:</h4>
                  <p className="mt-1 text-gray-900">{report.reason}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700">หลักฐาน:</h4>
                  <div className="mt-2">
                    <a
                      href={report.evidenceUrls}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-1" />
                      ดูหลักฐาน
                    </a>
                  </div>
                </div>
                {report.status === "pending" && (
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => onUpdateReportStatus(report.id, "valid")}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                      ยืนยัน
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => onUpdateReportStatus(report.id, "invalid")}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                      ปฏิเสธ
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50"
              onClick={() => {
                onBanStore(selectedReport.store.id);
                onClose();
              }}
            >
              <FontAwesomeIcon icon={faHammer} className="w-4 h-4 mr-2" />
              <span>แบนร้านค้า</span>
            </Button>
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 