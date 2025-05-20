import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle,
  faFileAlt,
  faUser,
  faCalendar
} from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store } from "@/types/stores";

// Fallback default logo
const defaultLogo = {
  src: "/images/logo.webp"
};

interface StoreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onApprove: (storeId: number) => void;
  onReject: (storeId: number) => void;
  onBan: (storeId: number) => void;
  onUnban: (storeId: number) => void;
}

export default function StoreDetailsModal({
  isOpen,
  onClose,
  store,
  onApprove,
  onReject,
  onBan,
  onUnban
}: StoreDetailsModalProps) {
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

  // Check if store has additional property (might be custom field)
  const isAdditionalStore = store?.userId > 0 && store?.isVerified === null && !store?.isBanned;

  if (!store) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">ข้อมูลร้านค้า</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 my-4">
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={
                  store.imageStore ||
                  "/images/logo.webp"
                }
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.srcset = defaultLogo.src;
                }}
                alt={store.storeName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">
                {store.storeName}
              </h3>
              <div className="mt-1 flex flex-wrap gap-2">
                {store.isVerified && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                    ยืนยันแล้ว
                  </Badge>
                )}
                {store.isBanned && (
                  <Badge variant="destructive">
                    <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                    ถูกแบน
                  </Badge>
                )}
                {isAdditionalStore && (
                  <Badge variant="outline">คำขอเพิ่มร้านค้า</Badge>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-gray-500" />
              รายละเอียด
            </h4>
            <p className="mt-1 text-gray-600">{store.description || "ไม่มีคำอธิบาย"}</p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-500" />
              ข้อมูลการติดต่อ
            </h4>
            <div className="mt-1 space-y-2">
              {typeof store.contactInfo === 'string' 
                ? Object.entries(JSON.parse(store.contactInfo)).map(
                    ([key, value]) => (
                      <p key={key} className="text-gray-600">
                        <span className="capitalize">{key}:</span>{" "}
                        <span className="font-medium">{value as string}</span>
                      </p>
                    )
                  )
                : Object.entries(store.contactInfo || {}).map(
                    ([key, value]) => (
                      <p key={key} className="text-gray-600">
                        <span className="capitalize">{key}:</span>{" "}
                        <span className="font-medium">{value as string}</span>
                      </p>
                    )
                  )
              }
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-gray-500" />
                วันที่สร้าง
              </h4>
              <p className="mt-1 text-gray-600">
                {formatDate(store.createdAt)}
              </p>
            </div>
            {store.updatedAt && (
              <div>
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-gray-500" />
                  วันที่อัปเดต
                </h4>
                <p className="mt-1 text-gray-600">
                  {formatDate(store.updatedAt)}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            {store.isVerified === null && !store.isBanned && (
              <>
                <Button
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => {
                    onApprove(store.id);
                    onClose();
                  }}
                >
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                  อนุมัติ
                </Button>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    onReject(store.id);
                    onClose();
                  }}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-2" />
                  ปฏิเสธ
                </Button>
              </>
            )}
            {store.isVerified === true && !store.isBanned && (
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => {
                  onBan(store.id);
                  onClose();
                }}
              >
                <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-2" />
                แบนร้านค้า
              </Button>
            )}
            {store.isBanned && (
              <Button
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => {
                  onUnban(store.id);
                  onClose();
                }}
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                ยกเลิกแบน
              </Button>
            )}
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 