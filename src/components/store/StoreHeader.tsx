import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons';
import VerificationBadge from "@/components/ui/VerificationBadge";
import AuthenticatedImage from "@/components/ui/AuthenticatedImage";
import { Store } from "@/types/stores";
import defaultLogo from "@images/logo-placeholder.png";

interface StoreHeaderProps {
  store: Store;
}

export default function StoreHeader({ store }: StoreHeaderProps) {
  return (
    <div className="px-6 py-5 sm:px-8 bg-gradient-to-r from-blue-50 to-white">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm">
            <AuthenticatedImage
              src={store.imageStore}
              alt={store.storeName}
              fill
              className="object-cover"
              sizes="(max-width: 96px) 100vw, 96px"
              fallbackSrc={defaultLogo.src}
              style={{
                color: undefined, // This is required to prevent the inline style of `next/image`
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {store.storeName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {store?.displayName}
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