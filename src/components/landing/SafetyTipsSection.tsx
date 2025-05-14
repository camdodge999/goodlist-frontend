import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt, 
  faExclamationTriangle,
  faSearch,
  faQuestionCircle,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { faqs } from "@/consts/faqs";
import { safetyTips } from '@/consts/safetyTip';

// Get popular FAQs
const popularFaqs = [
  faqs.find(faq => faq.id === "what-is-goodlist"),
  faqs.find(faq => faq.id === "data-security"),
  faqs.find(faq => faq.id === "privacy-policy"),
].filter(Boolean);


export function SafetyTipsSection() {
  return (
    <section className="py-24 bg-white">
      <ContentWidth>
        {/* Safety Tips Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            วิธีหลีกเลี่ยงการหลอกลวงในการช้อปปิ้งออนไลน์
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            เรียนรู้วิธีการช้อปปิ้งออนไลน์อย่างปลอดภัยและหลีกเลี่ยงการถูกหลอกลวง
          </p>
        </div>

        {/* Safety Tips Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {safetyTips.map(tip => (
            <div key={tip.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="relative h-48 w-full">
                <Image 
                  src={tip.image} 
                  alt={tip.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{tip.title}</h3>
                <p className="text-gray-600">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Popular FAQs */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 shadow-md mb-16">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
              <div className="flex items-center mb-4">
                <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-600 text-2xl mr-3" />
                <h3 className="text-2xl font-bold">คำถามที่พบบ่อย</h3>
              </div>
              <p className="text-gray-600 mb-6">
                คำตอบสำหรับคำถามทั่วไปเกี่ยวกับการช้อปปิ้งออนไลน์อย่างปลอดภัยและบริการของเรา
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/faq">
                  ดูคำถามทั้งหมด
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
              </Button>
            </div>
            <div className="md:w-2/3">
              <Accordion type="single" collapsible className="w-full">
                {popularFaqs.map(faq => faq && (
                  <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-100">
                    <AccordionTrigger className="text-lg hover:text-blue-600 transition-colors">
                      {faq.question.th}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-gray-600">{faq.answer.th}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">ช้อปปิ้งออนไลน์อย่างปลอดภัยกับ GoodList</h3>
              <p className="mb-6">
                ใช้เครื่องมือตรวจสอบร้านค้าของเราเพื่อหลีกเลี่ยงการหลอกลวงและช้อปปิ้งกับร้านค้าที่น่าเชื่อถือเท่านั้น
              </p>
              <Button asChild className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/store-checker">
                  ตรวจสอบร้านค้าเลย
                  <FontAwesomeIcon icon={faSearch} className="ml-2" />
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