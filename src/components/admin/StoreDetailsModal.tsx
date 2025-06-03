
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle,
  faFileAlt,
  faUser,
  faCalendar,
  faHammer
} from '@fortawesome/free-solid-svg-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Store } from "@/types/stores";
import { formatDate } from "@/lib/utils";
import AuthenticatedImage from "@/components/ui/AuthenticatedImage";
import defaultLogo from "@images/logo.webp";


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
  // Check if store has additional property (might be custom field)
  const isAdditionalStore = store?.userId && store?.userId > 0 && store?.isVerified === null && !store?.isBanned;

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
              <AuthenticatedImage
                src={store.imageStore}
                alt={store.storeName || "ไม่มีชื่อร้าน"}
                fill
                className="object-cover"
                fallbackSrc={defaultLogo.src}
                style={{
                  color: undefined, // This is required to prevent the inline style of `next/image`
                }}
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
                    <FontAwesomeIcon icon={faHammer} className="w-3 h-3 mr-1" />
                    <span>ถูกแบน</span>
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
                  <span>อนุมัติ</span>
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
                  <span>ปฏิเสธ</span>
                </Button>
              </>
            )}
            {store.isVerified === true && !store.isBanned && (
              <Button
                variant="outline"
                onClick={() => {
                  onBan(store.id);
                  onClose();
                }}
                className="bg-slate-600 text-white hover:bg-slate-700 border-slate-600"
              >
                <FontAwesomeIcon icon={faHammer} className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">แบน</span>
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
                <span>ยกเลิกแบน</span>
              </Button>
            )}
            <Button onClick={onClose}>ปิด</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 