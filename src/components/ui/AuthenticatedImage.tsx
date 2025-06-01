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
  style?: React.CSSProperties;
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
  priority = false,
  style
}) => {
  const { authenticatedUrl, isLoading } = useAuthenticatedImage(src);

  // Show loading state
  if (isLoading) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} />;
  }

  // Use authenticated URL or fallback
  const imageSrc = authenticatedUrl || fallbackSrc;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget as HTMLImageElement;
    target.srcset = fallbackSrc;
  };

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    onError: onError || handleImageError,
    priority,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes }),
    ...(style && { style })
  };

  return <Image {...imageProps} />;
};

export default AuthenticatedImage; 