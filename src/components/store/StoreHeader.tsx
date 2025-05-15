import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import VerificationBadge from "@/components/ui/VerificationBadge";
import Image from "next/image";
import { Store, User } from "@/types/stores";
import defaultLogo from "@images/logo.png";

interface StoreHeaderProps {
  store: Store;
  storeOwner?: User;
}

export default function StoreHeader({ store, storeOwner }: StoreHeaderProps) {
  return (
    <div className="px-6 py-5 sm:px-8 bg-gradient-to-r from-blue-50 to-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={store.imageStore || "/images/logo.png"}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.srcset = defaultLogo.src;
              }}
              alt={store.storeName}
              aria-describedby='store-image'
              fill
              className="object-cover"
              sizes="(max-width: 96px) 100vw, 96px"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {store.storeName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {storeOwner?.displayName}
              </span>
            </div>
          </div>
        </div>
        <VerificationBadge
          status={store.isVerified ? "verified" : "pending"}
        />
      </div>
    </div>
  );
} 