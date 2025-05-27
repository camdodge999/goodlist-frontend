"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import TermsModal from "@/components/auth/TermsModal";
import PrivacyPolicyModal from "@/components/shared/PrivacyPolicyModal";

export default function ModalExample() {
  const [showTerms, setShowTerms] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">ตัวอย่างการใช้งาน Modal</h2>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">ข้อกำหนดและเงื่อนไขการใช้งาน</h3>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={() => setShowTerms(true)}
            >
              แสดงข้อกำหนดและเงื่อนไข
            </Button>
            <div className="text-sm">
              สถานะ: {acceptedTerms ? (
                <span className="text-green-600 font-medium">ยอมรับแล้ว</span>
              ) : (
                <span className="text-amber-600 font-medium">ยังไม่ได้ยอมรับ</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">นโยบายความเป็นส่วนตัว</h3>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={() => setShowPrivacyPolicy(true)}
            >
              แสดงนโยบายความเป็นส่วนตัว
            </Button>
            <div className="text-sm">
              สถานะ: {acceptedPrivacyPolicy ? (
                <span className="text-green-600 font-medium">ยอมรับแล้ว</span>
              ) : (
                <span className="text-amber-600 font-medium">ยังไม่ได้ยอมรับ</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-4">
            ตัวอย่างการใช้งาน Modal ทั้งสองแบบในหน้าลงทะเบียนหรือสมัครสมาชิก
          </p>
          <Button 
            disabled={!acceptedTerms || !acceptedPrivacyPolicy}
            className="w-full"
          >
            ลงทะเบียน
          </Button>
          {(!acceptedTerms || !acceptedPrivacyPolicy) && (
            <p className="text-xs text-red-500 mt-2">
              กรุณายอมรับข้อกำหนดและเงื่อนไขการใช้งาน และนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ
            </p>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <TermsModal 
        showTerms={showTerms} 
        setShowTerms={setShowTerms} 
        setAcceptedTerms={setAcceptedTerms} 
      />
      
      <PrivacyPolicyModal 
        showPrivacyPolicy={showPrivacyPolicy} 
        setShowPrivacyPolicy={setShowPrivacyPolicy} 
        setAcceptedPrivacyPolicy={setAcceptedPrivacyPolicy} 
      />
    </div>
  );
} 