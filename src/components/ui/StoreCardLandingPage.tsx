'use client'

import { Store } from "@/types/stores";

import { ContactInfo } from "@/types/stores";

import { isValidJSON } from "@/utils/valid-json";
import { Badge, Link } from "lucide-react";
import { Card } from "./card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "./button";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { getAuthenticatedImageUrl } from "@/lib/utils";
import Image from "next/image";
import defaultLogo from "@images/logo-placeholder.png";
import ContactInfoCard from "@/components/store/ContactInfoCard";

interface StoreCardLandingPageProps {
    store: Store;
    index: number;
}

// Store card component
export default function StoreCardLandingPage({ store, index }: StoreCardLandingPageProps) {
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
              src={getAuthenticatedImageUrl(store.imageStore) || defaultLogo.src}
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
              <ContactInfoCard contactInfo={contactInfo as ContactInfo} userEmail={store.email} />
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
  