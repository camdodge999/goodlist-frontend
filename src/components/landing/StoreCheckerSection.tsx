import React from 'react';
import Link from "next/link";
import  { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faSearch, 
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { howItWorksSteps, safetyLevels } from "@/consts/storeChecker";
import { Step, SafetyLevel } from "@/types/storeChecker";
// Header component
const SectionHeader = () => (
  <div className="text-center mb-16">
    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
      ตรวจสอบร้านค้าออนไลน์
    </h2>
    <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
      เช็คความน่าเชื่อถือของร้านค้าออนไลน์ก่อนซื้อสินค้า เพื่อความปลอดภัยในการช้อปปิ้งออนไลน์ของคุณ
    </p>
  </div>
);

// Search tool component
const SearchTool = () => (
  <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-16">
    <div className="flex flex-col md:flex-row gap-4">
      <Input 
        type="text" 
        placeholder="ใส่ชื่อร้านค้าหรือ URL ที่ต้องการตรวจสอบ" 
        className="flex-1"
      />
      <Button className="bg-blue-600 hover:bg-blue-700">
        <FontAwesomeIcon icon={faSearch} className="mr-2" />
        ตรวจสอบร้านค้า
      </Button>
    </div>
  </div>
);

// How it works component
const HowItWorks = () => (
  <div className="mb-20">
    <h3 className="text-2xl font-bold text-center mb-12">วิธีการตรวจสอบร้านค้า</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {howItWorksSteps.map((step: Step) => (
        <div key={step.id} className="bg-white rounded-xl p-6 shadow-md text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl font-bold">{step.id}</span>
          </div>
          <h4 className="text-xl font-semibold mb-3">{step.title}</h4>
          <p className="text-gray-600">{step.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Safety levels component
const SafetyLevelsSection = () => (
  <div className="mb-20">
    <h3 className="text-2xl font-bold text-center mb-12">ระดับความน่าเชื่อถือ</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {safetyLevels.map((level: SafetyLevel) => (
        <div key={level.id} className={`bg-white rounded-xl p-6 shadow-md border-t-4 ${level.borderColor}`}>
          <div className="flex items-center mb-4">
            <FontAwesomeIcon icon={level.icon} className={`${level.textColor} text-2xl mr-3`} />
            <h4 className="text-xl font-semibold">{level.title}</h4>
          </div>
          <p className="text-gray-600">{level.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Safety tips CTA component
const SafetyTipsCTA = () => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
    <div className="flex flex-col md:flex-row items-center">
      <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
        <h3 className="text-2xl font-bold mb-4">เคล็ดลับการช้อปปิ้งออนไลน์อย่างปลอดภัย</h3>
        <p className="mb-6">เรารวบรวมเคล็ดลับและคำแนะนำในการช้อปปิ้งออนไลน์อย่างปลอดภัย เพื่อให้คุณมั่นใจในทุกการซื้อสินค้า</p>
        <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
          <Link href="/faq">
            อ่านเคล็ดลับเพิ่มเติม
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
        </Button>
      </div>
      <div className="md:w-1/3 flex justify-center">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
          <FontAwesomeIcon icon={faShieldAlt} className="text-white text-4xl" />
        </div>
      </div>
    </div>
  </div>
);

// Main component
export function StoreCheckerSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <ContentWidth>
        <SectionHeader />
        <SearchTool />
        {/* <ExampleResults /> */}
        <HowItWorks />
        <SafetyLevelsSection />
        <SafetyTipsCTA />
      </ContentWidth>
    </section>
  );
} 