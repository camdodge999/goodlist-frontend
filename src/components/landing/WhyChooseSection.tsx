import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCheckCircle, faShield, faUsers } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import Shield from '@/components/icon/Shield';

export function WhyChooseSection() {
    return (
        <section className="py-16 bg-white">
            <ContentWidth>
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="inline-flex items-center justify-center mb-4 space-x-2">
                        <Shield />
                        <span className="text-sm font-medium text-gray-600">ปลอดภัย ไว้ใจได้</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        ทำไมต้องเลือก Goodlist Seller?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl">
                        เรามุ่งมั่นที่จะสร้างแพลตฟอร์มที่เชื่อถือได้สำหรับการซื้อขายออนไลน์ในประเทศไทย
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Card 1 */}
                    <div className="bg-white border border-gray-100 border-b-4 border-b-blue-500 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start">
                        <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                            <FontAwesomeIcon icon={faCheckCircle} className="w-7 h-7 text-blue-600 text-2xl" fixedWidth />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            ร้านค้าที่ผ่านการตรวจสอบ
                        </h3>
                        <p className="text-gray-600">
                            ร้านค้าทุกร้านผ่านการตรวจสอบความน่าเชื่อถืออย่างเข้มงวด
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-gray-100 border-b-4 border-b-blue-500 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start">
                        <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6 relative">
                            <FontAwesomeIcon icon={faFile} className="w-7 h-7 text-blue-600 text-2xl" fixedWidth />
                            <FontAwesomeIcon icon={faCheck} className="text-blue-600 text-xs absolute bottom-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" fixedWidth />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            ระบบความปลอดภัย
                        </h3>
                        <p className="text-gray-600">
                            ระบบความปลอดภัยที่ทันสมัยเพื่อปกป้องข้อมูลและคู่ซื้อขาย
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white border border-gray-100 border-b-4 border-b-blue-500 rounded-xl p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start">
                        <div className="bg-blue-50 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                            <FontAwesomeIcon icon={faUsers} className="w-7 h-7 text-blue-600 text-2xl" fixedWidth />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                            ชุมชนที่เข้มแข็ง
                        </h3>
                        <p className="text-gray-600">
                            ชุมชนผู้ซื้อและผู้ขายที่ช่วยเหลือกันและกัน
                        </p>
                    </div>
                </div>
            </ContentWidth>
        </section>
    );
} 