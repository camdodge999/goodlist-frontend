import React from 'react';
import AuthenticatedImage from '@/components/ui/AuthenticatedImage';
import defaultLogo from "@images/logo.webp";

interface StoreItemImageProps {
  imageStore: string | null | undefined;
  storeName: string;
  className?: string;
}

const StoreItemImage: React.FC<StoreItemImageProps> = ({ 
  imageStore, 
  storeName, 
  className = "relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0" 
}) => {
  return (
    <div className={className}>
      <AuthenticatedImage 
        src={imageStore}
        alt={storeName}
        fill
        className="object-cover"
        fallbackSrc={defaultLogo.src}
        style={{
          color: undefined, // This is required to prevent the inline style of `next/image`
        }}
      />
    </div>
  );
};

export default StoreItemImage; 