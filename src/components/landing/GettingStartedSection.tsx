"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ContentWidth from "@/components/layout/ContentWidth";
import { 
  Search, 
  Store, 
  FileCheck, 
  BadgeCheck,
  MessagesSquare
} from "lucide-react";
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { faStore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faRotate } from '@fortawesome/free-solid-svg-icons';

// Define the feature card interface
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

// Feature card component
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300 border border-gray-100 border-b-4 border-b-blue-500">
    <div className="bg-blue-50 p-4 rounded-full mb-4">
      <div className="text-blue-600 w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </Card>
);

// Buyer features
const buyerFeatures = [
  {
    icon: <Search className="w-10 h-10" />,
    title: "ค้นหา",
    description: "ค้นหาร้านค้าที่คุณสนใจจากรายการร้านค้าที่ผ่านการตรวจสอบ"
  },
  {
    icon: <Store className="w-10 h-10" />,
    title: "ดูโปรไฟล์",
    description: "ตรวจสอบรายละเอียดร้านค้าและรีวิวจากผู้ซื้อ"
  },
  {
    icon: <MessagesSquare className="w-10 h-10" />,
    title: "ติดต่อร้าน",
    description: "ติดต่อร้านค้าผ่านระบบแชทที่ปลอดภัย"
  }
];

// Seller features
const sellerFeatures = [
  {
    icon: <FontAwesomeIcon icon={faUserPlus} className="text-3xl" />,
    title: "สมัครสมาชิก",
    description: "สมัครสมาชิกและกรอกข้อมูลร้านค้าของคุณ"
  },
  {
    icon: <FileCheck className="w-10 h-10" />,
    title: "ยืนยันตัวตน",
    description: "ส่งเอกสารยืนยันตัวตนเพื่อตรวจสอบความน่าเชื่อถือ"
  },
  {
    icon: <BadgeCheck className="w-10 h-10" />,
    title: "ได้รับ Badge",
    description: "รับ Badge ร้านค้าที่ผ่านการตรวจสอบ"
  }
];

export function GettingStartedSection() {
  const [activeTab, setActiveTab] = useState("buyer");
  
  return (
    <section className="py-24 bg-white">
      <ContentWidth>
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-2 mb-4">
            <FontAwesomeIcon icon={faRotate} className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">วิธีการใช้งาน</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            เริ่มต้นใช้งานได้ง่ายๆ
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            เพียงไม่กี่ขั้นตอน คุณก็สามารถเริ่มใช้งาน Goodlistseller ได้
          </p>
        </div>
        
        <Tabs 
          defaultValue="buyer" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-12">
            <TabsList className="grid grid-cols-2 w-full h-fit max-w-md cursor-pointer">
              <TabsTrigger value="buyer" className="px-8 py-3 cursor-pointer active:cursor-default">
                <FontAwesomeIcon icon={faUserGroup} className="mr-2" />
                <span>สำหรับผู้ซื้อ</span>
              </TabsTrigger>
              <TabsTrigger value="seller" className="px-8 py-3 cursor-pointer active:cursor-default">
                <FontAwesomeIcon icon={faStore} className="mr-2" />
                <span>สำหรับผู้ขาย</span>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="buyer" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {buyerFeatures.map((feature, index) => (
                <FeatureCard 
                  key={`buyer-${index}`}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="seller" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {sellerFeatures.map((feature, index) => (
                <FeatureCard 
                  key={`seller-${index}`}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </ContentWidth>
    </section>
  );
} 