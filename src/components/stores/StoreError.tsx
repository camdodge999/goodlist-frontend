"use client";

import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faRedo, faHome, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

interface StoreErrorProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export default function StoreError({ message, onRetry }: StoreErrorProps) {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-[40vh] flex items-center justify-center py-12">
          <div className="max-w-lg w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="bg-red-100 rounded-full p-4">
                <FontAwesomeIcon 
                  icon={faExclamationTriangle} 
                  className="h-16 w-16 text-red-600 animate-pulse" 
                />
              </div>
            </div>
            
            {/* Error Message */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                เกิดข้อผิดพลาดในการโหลดข้อมูล
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {message}
              </p>
            </div>
            
            {/* Troubleshooting Tips */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
                คำแนะนำในการแก้ไขปัญหา
              </h3>
              <ul className="text-sm text-blue-700 space-y-1 pl-6 list-disc">
                <li>ตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ</li>
                <li>รีเฟรชหน้าเว็บและลองอีกครั้ง</li>
                <li>ล้างแคชและคุกกี้ของเบราว์เซอร์</li>
                <li>หากปัญหายังคงอยู่ โปรดติดต่อฝ่ายสนับสนุน</li>
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FontAwesomeIcon icon={faRedo} className="mr-2" />
                ลองใหม่อีกครั้ง
              </Button>
              
              <Link href="/">
                <Button 
                  variant="outline"
                  className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <FontAwesomeIcon icon={faHome} className="mr-2" />
                  กลับหน้าหลัก
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 