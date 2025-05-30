import { Metadata } from 'next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faMapMarkerAlt, 
  faPhone
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { metadataPages } from "@/consts/metadata";

export const metadata: Metadata = {
  title: metadataPages.contact.title,  
  description: metadataPages.contact.description,
};

export default function ContactPage() {
  return (
    <>
      <div className="bg-gray-50 py-16">
        <ContentWidth>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ติดต่อเรา</h1>
            <p className="text-lg text-gray-600 mb-12">
              มีคำถาม ข้อเสนอแนะ หรือต้องการความช่วยเหลือ? เราพร้อมให้บริการคุณ
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow-md rounded-lg p-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">ส่งข้อความถึงเรา</h2>
                  
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          ชื่อ *
                        </label>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="กรอกชื่อของคุณ" 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          อีเมล *
                        </label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="example@email.com" 
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        หัวข้อ *
                      </label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        placeholder="หัวข้อของข้อความ" 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        ข้อความ *
                      </label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        rows={6} 
                        placeholder="กรอกข้อความของคุณที่นี่..." 
                        required 
                      />
                    </div>
                    
                    <div>
                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        ส่งข้อความ
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
              
              {/* Contact Info */}
              <div>
                <div className="bg-blue-600 text-white shadow-md rounded-lg p-8 h-full">
                  <h2 className="text-2xl font-semibold mb-6">ข้อมูลติดต่อ</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="h-6 w-6 mt-1 mr-4" />
                      <div>
                        <h3 className="font-medium text-lg">ที่อยู่</h3>
                        <p className="mt-1 text-blue-100">
                          123 ถนนสุขุมวิท แขวงคลองตันเหนือ<br />
                          เขตวัฒนา กรุงเทพฯ 10110
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faPhone} className="h-6 w-6 mt-1 mr-4" />
                      <div>
                        <h3 className="font-medium text-lg">โทรศัพท์</h3>
                        <p className="mt-1 text-blue-100">02-123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FontAwesomeIcon icon={faEnvelope} className="h-6 w-6 mt-1 mr-4" />
                      <div>
                        <h3 className="font-medium text-lg">อีเมล</h3>
                        <p className="mt-1 text-blue-100">
                          <a href="mailto:contact@goodlistseller.com" className="hover:underline">
                            contact@goodlistseller.com
                          </a>
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-blue-500">
                      <h3 className="font-medium text-lg mb-3">เวลาทำการ</h3>
                      <p className="text-blue-100">
                        จันทร์ - ศุกร์: 9:00 - 18:00 น.<br />
                        เสาร์: 9:00 - 15:00 น.<br />
                        อาทิตย์: ปิดทำการ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="mt-12 bg-white shadow-md rounded-lg p-4">
              <div className="aspect-[16/9] w-full bg-gray-200 rounded overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.5392139177743!2d100.56324371527504!3d13.742349290354908!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29ee109dab6e1%3A0xfd15aa1c632d9677!2sSukhumvit%20Rd%2C%20Khlong%20Toei%2C%20Bangkok!5e0!3m2!1sen!2sth!4v1650450351232!5m2!1sen!2sth" 
                  width="100%" 
                  height="100%" 
                  className="border-0"
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </ContentWidth>
      </div>
      <Footer />
    </>
  );
} 