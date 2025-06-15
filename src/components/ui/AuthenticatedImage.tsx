import React from 'react';
import Image from 'next/image';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';
import defaultLogo from "@images/logo.webp";

// Define specific image formats
type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'gif' | 'webp' | 'svg+xml' | 'bmp' | 'tiff';

// More specific data URL type for images
type ImageDataURL<T extends ImageFormat = ImageFormat> = `data:image/${T};base64,${string}`;

// General data URL type (for any data URL)
type DataURL = `data:${string}`;

// Next.js compatible placeholder type
type Placeholder = "blur" | "empty";

interface AuthenticatedImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  fallbackSrc?: string;
  loading?: "lazy" | "eager";
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  width?: number;
  height?: number;
  priority?: boolean;
  style?: React.CSSProperties;
  placeholder?: Placeholder;
  blurDataURL?: ImageDataURL | DataURL; // For blur placeholder
} 

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ 
  src,
  alt,
  fill = false,
  className = "",
  sizes,
  fallbackSrc = "/images/logo.webp",
  placeholder,   
  loading = "lazy",
  onError,
  width,
  height,
  priority = false,
  style,
  blurDataURL
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
    target.srcset = defaultLogo.src;
  };

  const imageProps = {
    src: imageSrc,
    alt,
    className,
    onError: onError || handleImageError,
    ...(priority ? { priority: true } : { loading }),
    placeholder,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes }),
    ...(style && { style }),
    ...(blurDataURL && { blurDataURL })
  };

  return <Image {...imageProps} />;
};

export default AuthenticatedImage; 