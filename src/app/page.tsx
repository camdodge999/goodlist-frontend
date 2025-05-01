import { Metadata } from 'next';
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStore, 
  faSearch, 
  faCheckCircle,
  faCommentDots,
  faGlobeAmericas,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store } from "@/types/stores";
import { BodyResponse } from "@/types/response";

// Define ContactInfo type since it's not imported
type ContactInfo = {
  line?: string;
  facebook?: string;
  phone?: string;
  address?: string;
};

export const metadata: Metadata = {
  title: 'Goodlistseller - ร้านค้าออนไลน์ที่คุณไว้ใจได้',
  description: 'แพลตฟอร์มที่ช่วยให้คุณค้นหาร้านค้าออนไลน์ที่เชื่อถือได้ในประเทศไทย',
};

export default async function Home() {
  // Fetch stores from our API endpoint
  const storesResponse = await fetch(
    `${process.env.NEXT_PUBLIC_URL || ''}/api/stores`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Adding cache options for better performance
      next: { revalidate: 60 }, // Revalidate at most once per minute
    }
  );

  // Parse the JSON response
  const storesData: BodyResponse<Store[]> = await storesResponse.json();

  // Get first 3 verified stores for featured section
  const featuredStores = storesData.status === 'success' && storesData.data
    ? storesData.data
      .filter((store: Store) => store.isVerified)
      .slice(0, 3)
      .map((store: Store) => ({
        id: store.id,
        name: store.storeName,
        verified: store.isVerified,
        image: store.imageUrl,
        description: store.description,
        contactInfo: store.contactInfo,
      }))
    : [];

  return (
    <>
      {/* Hero Section */}
      <ContentWidth fullWidth>
        <div className="relative isolate min-h-screen overflow-hidden">
          {/* Background remains the same */}
          <div className="relative h-screen flex items-center">
            <div className="w-full text-center px-4 sm:px-6 lg:px-8">
              <div className="relative">
                <h1 className="relative text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                  รวมร้านค้าออนไลน์ที่คุณไว้ใจได้
                </h1>
                <h2 className="relative mt-4 text-2xl font-semibold tracking-tight text-gray-100 sm:text-3xl lg:text-4xl">
                  Trusted Online Stores in One Place
                </h2>
              </div>
              <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-100 max-w-3xl mx-auto">
                Goodlistseller -
                แพลตฟอร์มที่ช่วยให้คุณค้นหาร้านค้าออนไลน์ที่เชื่อถือได้ในประเทศไทย
                <br />
                Join our community of verified sellers and safe shoppers
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  <Link href="/signup">
                    <FontAwesomeIcon icon={faStore} className="mr-2" />
                    สมัครเป็นร้านค้า
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent text-white border-white hover:bg-white/10"
                >
                  <Link href="/stores">
                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                    ดูร้านค้าที่เชื่อถือได้
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ContentWidth>

      {/* Featured Stores Section */}
      <section className="py-24 bg-gray-50">
        <ContentWidth>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              ร้านค้าแนะนำ
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              ร้านค้าที่ผ่านการตรวจสอบและได้รับความไว้วางใจจากผู้ซื้อ
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredStores.map((store: {
              id: number;
              name: string;
              verified: boolean;
              image: string;
              description: string;
              contactInfo: ContactInfo | string;
            }, index: number) => {
              // Parse contact info if needed
              const contactInfo: ContactInfo = typeof store.contactInfo === 'string' 
                ? JSON.parse(store.contactInfo) 
                : store.contactInfo;

              return (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-blue-500 bg-white">
                    {/* Image Container */}
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={store.image}
                        alt={store.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={index < 2}
                      />
                      {/* Verification Badge */}
                      {store.verified && (
                        <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 shadow-lg">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                          ผ่านการตรวจสอบ
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {store.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {store.description}
                      </p>

                      {/* Contact Info */}
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
            })}
          </div>
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
        </ContentWidth>
      </section>

      {/* Remaining sections would be similarly updated */}
    </>
  );
} 