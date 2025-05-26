import React from 'react';
import Image from 'next/image';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';

interface AuthenticatedImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  fallbackSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  width?: number;
  height?: number;
  priority?: boolean;
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ 
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  fallbackSrc = "/images/logo.webp",
  onError,
  width,
  height,
  priority = false
}) => {
  const { authenticatedUrl, isLoading } = useAuthenticatedImage(src);

  // Show loading state
  if (isLoading) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} />;
  }

  // Use authenticated URL or fallback
  const imageSrc = authenticatedUrl || fallbackSrc;

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    onError: onError || ((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.currentTarget as HTMLImageElement;
      target.src = fallbackSrc;
    }),
    priority,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes })
  };

  return <Image {...imageProps} />;
};

export default AuthenticatedImage; 