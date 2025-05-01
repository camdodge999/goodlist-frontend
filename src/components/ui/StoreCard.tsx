import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faCommentDots, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import VerificationBadge from "./VerificationBadge";
import Link from "next/link";
import Image from "next/image";
import type { Store, ContactInfo } from "@/types/stores";

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
  try {
    if (store.contactInfo) {
      contactInfo =
        typeof store.contactInfo === "string"
          ? JSON.parse(store.contactInfo)
          : store.contactInfo;
    }
  } catch (error) {
    console.error("Error parsing contact info:", error);
  }

  return (
    <Link href={`/stores/${store.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Store Image */}
        <div className="relative h-48 w-full">
          <Image
            src={store.imageUrl || "/images/stores/default-store.jpg"}
            alt={store.storeName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faStore} className="w-8 h-8 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {store.storeName}
                </h3>
                <p className="text-sm text-gray-500">
                  @{store.storeName.toLowerCase().replace(/\s+/g, "")}
                </p>
              </div>
            </div>
            <VerificationBadge
              status={store.isVerified ? "verified" : "pending"}
            />
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-gray-600">
              <FontAwesomeIcon icon={faCommentDots} className="w-5 h-5" />
              <div className="text-sm">
                <p>Line: {contactInfo.line || "ไม่ระบุ"}</p>
                <p>Facebook: {contactInfo.facebook || "ไม่ระบุ"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <FontAwesomeIcon icon={faCreditCard} className="w-5 h-5" />
              <div className="text-sm">
                <p>Bank Account: ••••••••••</p>
                <p className="text-xs text-blue-600 mt-1">
                  Click to view full details
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 