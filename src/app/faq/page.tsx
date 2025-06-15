import { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faShieldAlt, faUserLock, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faqs } from "@/consts/faqs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "คำถามที่พบบ่อย | Goodlistseller",
  description: "ค้นหาคำตอบสำหรับคำถามทั่วไปเกี่ยวกับนโยบายและการใช้งานของเรา",
};

export default function FAQPage() {
  // Filter FAQs by category
  const accountFaqs = faqs.filter(faq => faq.category === 'account');
  const policyFaqs = faqs.filter(faq => faq.category === 'policy');
  const securityFaqs = faqs.filter(faq => faq.category === 'security');
  const generalFaqs = faqs.filter(faq => faq.category === 'general');

  // Thai language content
  const pageDescription = 'ค้นหาคำตอบสำหรับคำถามทั่วไปเกี่ยวกับนโยบายและการใช้งานของเรา';

  // Section titles in Thai
  const sectionTitles = {
    general: 'ทั่วไป',
    account: 'การจัดการบัญชี',
    policy: 'นโยบายและเงื่อนไข',
    security: 'ความปลอดภัยของข้อมูล',
    cookies: 'คุกกี้และการติดตาม'
  };

  // Contact section text in Thai
  const contactTitle = 'ยังมีคำถามอยู่หรือไม่?';
  const contactDescription = 'หากคุณยังไม่พบคำตอบสำหรับคำถามของคุณ โปรดติดต่อทีมสนับสนุนของเรา';
  const contactButtonText = 'ติดต่อฝ่ายสนับสนุน';

  // Icon colors for each section
  const iconColors = {
    general: "text-blue-500",
    account: "text-purple-500",
    policy: "text-indigo-500",
    security: "text-teal-500",
    cookies: "text-pink-500"
  };

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 mb-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold pt-4 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            คำถามที่พบบ่อย
          </h1>
          <p className="text-gray-600 text-lg">{pageDescription}</p>
        </div>
        
        {/* General FAQs */}
        <div className="mb-10 bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b pb-3">
            <FontAwesomeIcon icon={faInfoCircle} className={`${iconColors.general} text-xl`} />
            <h2 className="text-2xl font-semibold text-gray-800">{sectionTitles.general}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {generalFaqs.map(faq => (
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
        
        {/* Account Management FAQs */}
        <div className="mb-10 bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b pb-3">
            <FontAwesomeIcon icon={faQuestionCircle} className={`${iconColors.account} text-xl`} />
            <h2 className="text-2xl font-semibold text-gray-800">{sectionTitles.account}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {accountFaqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-100">
                <AccordionTrigger className="text-lg hover:text-purple-600 transition-colors">
                  {faq.question.th}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">{faq.answer.th}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Policies & Terms FAQs */}
        <div className="mb-10 bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b pb-3">
            <FontAwesomeIcon icon={faShieldAlt} className={`${iconColors.policy} text-xl`} />
            <h2 className="text-2xl font-semibold text-gray-800">{sectionTitles.policy}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {policyFaqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-100">
                <AccordionTrigger className="text-lg hover:text-indigo-600 transition-colors">
                  {faq.question.th}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">{faq.answer.th}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Data Security FAQs */}
        <div className="mb-10 bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b pb-3">
            <FontAwesomeIcon icon={faUserLock} className={`${iconColors.security} text-xl`} />
            <h2 className="text-2xl font-semibold text-gray-800">{sectionTitles.security}</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {securityFaqs.map(faq => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b border-gray-100">
                <AccordionTrigger className="text-lg hover:text-teal-600 transition-colors">
                  {faq.question.th}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-600">{faq.answer.th}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 mt-12 text-white shadow-lg">
          <h3 className="text-2xl font-semibold mb-3">{contactTitle}</h3>
          <p className="mb-6 text-white/90">{contactDescription}</p>
          <Link 
            href="https://www.facebook.com/goodlistseller" 
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
          >
            {contactButtonText} 
          </Link>
        </div>
      </div>
    </div>
  );
}
