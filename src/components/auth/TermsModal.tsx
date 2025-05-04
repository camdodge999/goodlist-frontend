"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsModalProps {
  showTerms: boolean;
  setShowTerms: Dispatch<SetStateAction<boolean>>;
  setAcceptedTerms: Dispatch<SetStateAction<boolean>>;
}

export default function TermsModal({
  showTerms,
  setShowTerms,
  setAcceptedTerms,
}: TermsModalProps) {
  return (
    <Dialog open={showTerms} onOpenChange={setShowTerms}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </DialogTitle>
        </DialogHeader>

        <div className="prose max-w-none text-gray-700 space-y-6 my-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900">
              เว็บไซต์: Goodlistseller.com
            </h3>
          </div>
          
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              การใช้งานเว็บไซต์
            </h3>
            <p className="leading-relaxed">
              ตลอดเว็บไซต์นี้ คำว่า &quot;ผู้ใช้บริการ&quot; หมายถึงบุคคลใด ๆ
              ที่เข้าถึงเว็บไซต์นี้ไม่ว่าด้วยวิธีใดก็ตาม
              การใช้เว็บไซต์นี้ต้องเป็นไปตามข้อกำหนดและเงื่อนไขการใช้งานนี้
              ซึ่งผู้ใช้บริการควรอ่านอย่างละเอียด
              การใช้เว็บไซต์หรือเข้าเยี่ยมชมหน้าใด ๆ
              ถือว่าท่านยอมรับเงื่อนไขทั้งหมดแล้ว
            </p>
          </section>

          <div className="text-sm text-gray-600 mb-4">
            การกดยอมรับหมายถึงผู้ใช้บริการยินยอมตามนโยบาย พ.ร.บ.
            คุ้มครองข้อมูลส่วนบุคคล โดยมีรายละเอียดในลิงค์นี้
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="primary"
            onClick={() => {
              setAcceptedTerms(true);
              setShowTerms(false);
            }}
            className="w-full sm:w-auto cursor-pointer"
          >
            ยอมรับข้อกำหนดและเงื่อนไข
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 