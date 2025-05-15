import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle,
  faCommentDots,
  faGlobeAmericas,
  faArrowRight,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store } from "@/types/stores";
import { ContactInfo } from "@/types/stores";
import { isValidJSON } from "@/utils/valid-json";
import defaultLogo from "@images/logo.png";

interface FeaturedStoresSectionProps {
  featuredStores: Store[];
}

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
    } catch (error) {
      console.error("Error parsing contact info:", error);
      // Keep as string if parsing fails
    }
  }

  return (
    <Link
      href={`/stores/${store.id}`}
      className="group"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-blue-500 bg-white">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <Image
            src={store.imageStore || '/images/logo.png'}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              target.srcset = defaultLogo.src;
            }}
            alt={store.storeName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 2}
          />
          {/* Verification Badge */}
          {store.isVerified && (
            <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 shadow-lg">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              ผ่านการตรวจสอบ
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
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
              ดูรายละเอียดเพิ่มเติม
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
        <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-blue-500" />
        <span>Line: {contactInfo.line}</span>
      </div>
    )}
    {contactInfo.facebook && (
      <div className="flex items-center text-sm text-gray-600">
        <FontAwesomeIcon icon={faGlobeAmericas} className="mr-2 text-blue-500" />
        <span>Facebook: {contactInfo.facebook}</span>
      </div>
    )}
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
        ดูร้านค้าทั้งหมด
      </Link>
    </Button>
  </div>
);

// Main component
export function FeaturedStoresSection({ featuredStores }: FeaturedStoresSectionProps) {
  return (
    <section className="py-24 bg-gray-50">
      <ContentWidth>
        <SectionHeader />
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