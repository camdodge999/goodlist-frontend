import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle,
  faExclamationTriangle,
  faHammer
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import { Store } from "@/types/stores";
import defaultLogo from "@images/logo.webp";
import { isValidJSON } from "@/utils/valid-json";
import { getAuthenticatedImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StoreItemProps {
  store: Store;
  activeTab: string;
  onViewStore: (store: Store) => void;
  onViewReport: (store: Store) => void;
  onApproveStore: (storeId: number) => void;
  onRejectStore: (storeId: number) => void;
  onBanStore: (storeId: number) => void;
  onUnbanStore: (storeId: number) => void;
}

export default function StoreItem({
  store,
  activeTab,
  onViewStore,
  onViewReport,
  onApproveStore,
  onRejectStore,
  onBanStore,
  onUnbanStore
}: StoreItemProps) {
  // Check if store has additional property (might be custom field)
  const isAdditionalStore = store.userId > 0 && store.isVerified === null && !store.isBanned;

  return (
    <div className="px-4 py-4 sm:px-6 cursor-pointer" onClick={() => onViewStore(store)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
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
          <div className="ml-4">
            <button
              onClick={() => onViewStore(store)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {store.storeName}
            </button>
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
        <div className="ml-2 flex-shrink-0 flex space-x-2">
          {activeTab === "reported" && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewReport(store);
              }}
              className="bg-slate-600 text-white hover:bg-slate-700 border-slate-600"
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">ดูรายละเอียด</span>  
            </Button>
          )}
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
  );
} 