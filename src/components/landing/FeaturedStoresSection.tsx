"use client";

import React from 'react';
import Link from "next/link";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle,
  faArrowRight,
  faSearch,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store } from "@/types/stores";
import { ContactInfo } from "@/types/stores";
import { isValidJSON } from "@/utils/valid-json";
import defaultLogo from "@images/logo.webp";
import AuthenticatedImage from "@/components/ui/AuthenticatedImage";
import { useStore } from "@/contexts/StoreContext";
import EmptyStoreState from "@/components/ui/EmptyStoreState";
import { faLine, faFacebook } from '@fortawesome/free-brands-svg-icons';

// Section header component
const SectionHeader = () => (
  <div className="text-center mb-16">
    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      ร้านค้าแนะนำ
    </h2>
    <p className="mt-4 text-lg leading-8 text-gray-600">
      ร้านค้าที่ผ่านการตรวจสอบและได้รับความไว้วางใจจากผู้ซื้อ
    </p>
  </div>
);

// Store card component
const StoreCard = ({ store, index }: { store: Store; index: number }) => {
  // Parse contact info if needed
  let contactInfo: ContactInfo | string = store.contactInfo;
  
  if (typeof store.contactInfo === 'string' && isValidJSON(store.contactInfo)) {
    try {
      contactInfo = JSON.parse(store.contactInfo) as ContactInfo;
    } catch {
      // Keep as string if parsing fails
    }
  }

  return (
    <Link
      href={`/stores/${store.id}`}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 p-0 border-t-blue-500 bg-white">
        {/* Image Container */}
        <div className="relative h-56 w-full border-b border-gray-200">
          <AuthenticatedImage
            src={store.imageStore}
            alt={store.storeName}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-110"
            priority={index < 2}
            fallbackSrc={defaultLogo.src}
          />
          {/* Verification Badge */}
          {store.isVerified && (
            <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              <span>ผ่านการตรวจสอบ</span>
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-2 px-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
            {store.storeName}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {store.description}
          </p>

          {typeof contactInfo !== 'string' ? (
            <StoreContactInfo contactInfo={contactInfo} />
          ) : (
            <div className="text-sm text-gray-600">
              <pre className="whitespace-pre-wrap">{contactInfo}</pre>
            </div>
          )}

          {/* View More Button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <span>ดูรายละเอียดเพิ่มเติม</span>
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// Store contact info component
const StoreContactInfo = ({ contactInfo }: { contactInfo: ContactInfo }) => (
  <div className="space-y-2">
    {contactInfo.line && (
      <div className="flex items-center text-sm text-gray-600">
        <FontAwesomeIcon icon={faLine} className="mr-2 text-blue-500" />
        <span>Line: {contactInfo.line}</span>
      </div>
    )}
    {contactInfo.facebook && (
      <div className="flex items-center text-sm text-gray-600">
        <FontAwesomeIcon icon={faFacebook} className="mr-2 text-blue-500" />
        <span>Facebook: {contactInfo.facebook}</span>
      </div>
    )}
  </div>
);

// Error component
const ErrorMessage = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <FontAwesomeIcon icon={faExclamationTriangle} className="text-5xl text-red-500 mb-4" />
    <h3 className="text-xl font-semibold text-gray-900 mb-2">ไม่สามารถเชื่อมต่อได้</h3>
    <p className="text-gray-600 mb-6">กรุณาลองใหม่อีกครั้ง</p>
    <Button 
      onClick={() => window.location.reload()}
      className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300 active:cursor-progress"
    >
      <span>ลองใหม่</span>
    </Button>
  </div>
);

// View all stores button component
const ViewAllStoresButton = () => (
  <div className="mt-12 text-center">
    <Button
      asChild
      size="lg"
      className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-300"
    >
      <Link href="/stores">
        <FontAwesomeIcon icon={faSearch} className="mr-2" />
        <span>ดูร้านค้าทั้งหมด</span>
      </Link>
    </Button>
  </div>
);

// Main component - now uses StoreContext instead of props
export function FeaturedStoresSection() {
  const { getFeaturedStores, isLoading, error } = useStore();
  const featuredStores = getFeaturedStores(3);
  
  // Show error state for server errors (including 500)
  if (error) {
    return (
      <section className="py-24 bg-gray-50">
        <ContentWidth>
          <SectionHeader />
          <ErrorMessage />
        </ContentWidth>
      </section>
    );
  }
  
  if (isLoading) {
    return (
      <section className="py-24 bg-gray-50">
        <ContentWidth>
          <SectionHeader />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="h-96 animate-pulse bg-gray-100">
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-400">กำลังโหลด...</p>
                </div>
              </Card>
            ))}
          </div>
        </ContentWidth>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gray-50">
      <ContentWidth>
        <SectionHeader />
        {featuredStores.length === 0 && (
          <div className="mt-8">
            <EmptyStoreState />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredStores.map((store, index) => (
            <StoreCard key={store.id} store={store} index={index} />
          ))}
        </div>
        <ViewAllStoresButton />
      </ContentWidth>
    </section>
  );
} 