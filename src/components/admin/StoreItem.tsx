import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { Button } from "@/components/ui/button";
import { Store } from "@/types/stores";

interface StoreItemProps {
  store: Store;
  activeTab: string;
  onViewStore: (store: Store) => void;
  onViewReport: (store: Store) => void;
  onApproveStore: (storeId: string) => void;
  onRejectStore: (storeId: string) => void;
  onBanStore: (storeId: string) => void;
  onUnbanStore: (storeId: string) => void;
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
  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            <Image 
              src={store.imageStore || "/images/logo.webp"}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.srcset = defaultLogo.src;
              }}
              alt={store.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4">
            <button
              onClick={() => onViewStore(store)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {store.store_name}
            </button>
            <p className="text-xs text-gray-500">
              {JSON.parse(store.contact_info).line}
            </p>
            {store.is_additional_store && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                คำขอเพิ่มร้านค้า
              </span>
            )}
          </div>
        </div>
        <div className="ml-2 flex-shrink-0 flex space-x-2">
          {activeTab === "reported" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewReport(store)}
              className="text-yellow-600 hover:text-yellow-700 border-yellow-600 hover:border-yellow-700 hover:bg-yellow-50"
            >
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mr-1" />
              ดูรายละเอียด
            </Button>
          )}
          {!store.is_verified && !store.is_banned && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onApproveStore(store.id)}
                className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 hover:bg-green-50"
              >
                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                อนุมัติ
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRejectStore(store.id)}
                className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 hover:bg-red-50"
              >
                <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                ปฏิเสธ
              </Button>
            </>
          )}
          {store.is_verified && !store.is_banned && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBanStore(store.id)}
              className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 hover:bg-red-50"
            >
              <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
              แบนร้านค้า
            </Button>
          )}
          {store.is_banned && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnbanStore(store.id)}
              className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 hover:bg-green-50"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
              ยกเลิกแบน
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 