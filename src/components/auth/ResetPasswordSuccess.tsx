"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';

interface ResetPasswordSuccessProps {
  readonly onBackToLogin: () => void;  
}

export default function ResetPasswordSuccess({ onBackToLogin }: ResetPasswordSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl z-50 text-center"
    >
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="text-green-500 text-6xl">
          <FontAwesomeIcon icon={faEnvelopeOpen} />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">ส่งอีเมลสำเร็จ</h2>
        
        <p className="text-lg text-gray-600">
          กรุณาตรวจสอบกล่องข้อความของคุณเพื่อรีเซ็ตรหัสผ่าน
        </p>
        
        <Button 
          variant="primary"
          onClick={onBackToLogin}
          className="mt-4 min-w-[200px] cursor-pointer"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Button>
      </div>
    </motion.div>
  );
} 