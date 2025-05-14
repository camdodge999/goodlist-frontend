import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faSearch, 
  faCheckCircle,
  faExclamationTriangle,
  faInfoCircle,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { exampleStores, howItWorksSteps, safetyLevels } from "@/consts/storeChecker";
import { Step, StoreChecker, SafetyLevel } from "@/types/storeChecker";
export function StoreCheckerSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
      <ContentWidth>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            ตรวจสอบร้านค้าออนไลน์
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            เช็คความน่าเชื่อถือของร้านค้าออนไลน์ก่อนซื้อสินค้า เพื่อความปลอดภัยในการช้อปปิ้งออนไลน์ของคุณ
          </p>
        </div>

        {/* Store Checker Tool */}
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

        {/* Example Results */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-12">ตัวอย่างผลการตรวจสอบ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exampleStores.map((store: StoreChecker) => (
              <div 
                key={store.id} 
                className={`bg-white rounded-xl overflow-hidden shadow-md border-t-4 ${
                  store.trustLevel === "high" ? "border-green-500" : 
                  store.trustLevel === "medium" ? "border-yellow-500" : "border-red-500"
                }`}
              >
                <div className="relative h-48 w-full">
                  <Image 
                    src={store.image} 
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                  {store.verified && (
                    <Badge className="absolute top-4 right-4 bg-blue-600 text-white">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                      ร้านค้าที่ผ่านการตรวจสอบ
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xl font-semibold">{store.name}</h4>
                  </div>
                  <div className="flex items-center mb-4">
                    <FontAwesomeIcon 
                      icon={
                        store.trustLevel === "high" ? faCheckCircle : 
                        store.trustLevel === "medium" ? faInfoCircle : faExclamationTriangle
                      } 
                      className={`text-2xl mr-3 ${
                        store.trustLevel === "high" ? "text-green-500" : 
                        store.trustLevel === "medium" ? "text-yellow-500" : "text-red-500"
                      }`} 
                    />
                    <span className="font-medium">
                      {store.trustLevel === "high" ? "น่าเชื่อถือ" : 
                       store.trustLevel === "medium" ? "ควรระวัง" : "ไม่น่าเชื่อถือ"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {store.trustLevel === "high" 
                      ? "ร้านค้านี้มีความน่าเชื่อถือสูง สามารถซื้อสินค้าได้อย่างปลอดภัย" 
                      : store.trustLevel === "medium"
                      ? "ควรตรวจสอบข้อมูลเพิ่มเติมก่อนตัดสินใจซื้อสินค้า"
                      : "ไม่แนะนำให้ซื้อสินค้าจากร้านค้านี้ เนื่องจากมีความเสี่ยงสูง"
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
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

        {/* Safety Levels */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-center mb-12">ระดับความน่าเชื่อถือ</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* Safety Tips */}
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
      </ContentWidth>
    </section>
  );
} 