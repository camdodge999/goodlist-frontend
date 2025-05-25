import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faCreditCard, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faLine } from '@fortawesome/free-brands-svg-icons';  
import Link from "next/link";
import Image from "next/image";
import type { Store, ContactInfo } from "@/types/stores";
import { isValidJSON } from "@/utils/valid-json";
import { getAuthenticatedImageUrl } from '@/lib/utils';
import defaultLogo from "@images/logo-placeholder.png";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  // Parse the contact_info JSON string if it exists
  let contactInfo: ContactInfo = {
    line: "",
    facebook: "",
    phone: "",
    address: "",
  };

  const isValid = isValidJSON(store.contactInfo as string);
  
  try {
    if (isValid) {
      contactInfo = JSON.parse(store.contactInfo as string);
    } else if (store.contactInfo && typeof store.contactInfo !== 'string') {
      // Handle potential undefined properties in contactInfo
      contactInfo = {
        line: store.contactInfo.line || "",
        facebook: store.contactInfo.facebook || "",
        phone: store.contactInfo.phone || "",
        address: store.contactInfo.address || "",
      };
    }
  } catch (error) {
    console.error("Error parsing contact info:", error);
  }

  return (
    <Link href={`/stores/${store.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
        {/* Store Image */}
        <div className="relative h-48 w-full border-b border-gray-200">
          <Image
            src={getAuthenticatedImageUrl(store.imageStore) || defaultLogo.src}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.srcset = defaultLogo.src;
            }}
            alt={store.storeName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Store Information */}
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="text-slate-700">
                <FontAwesomeIcon icon={faStore} className="text-4xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{store.storeName}</h3>
                <p className="text-gray-500">@{store.storeName.toLowerCase().replace(/\s+/g, "")}</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs  flex items-center space-x-2">
              <FontAwesomeIcon icon={faCheckCircle} />
              <span>ผ่านการตรวจสอบ</span>
            </div>
          </div>
          
         
          
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <div className="text-slate-600">
              <FontAwesomeIcon icon={faLine} className="w-4 h-4" />
            </div>
            <div className="text-md">
              Line: {contactInfo.line || "ไม่ระบุ"}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <div className="text-slate-600">
              <FontAwesomeIcon icon={faFacebook} className="w-4 h-4" />
            </div>
            <div className="text-md">
              Facebook: {contactInfo.facebook || "ไม่ระบุ"}
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-gray-600 mt-3">
            <div className="text-slate-600">
              <FontAwesomeIcon icon={faCreditCard} />
            </div>
            <div className="text-md">
              <span>บัญชีธนาคาร : •••••••••</span>
              <div className="text-blue-600 text-xs cursor-pointer">คลิกเพื่อดูข้อมูลเพิ่มเติม</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 