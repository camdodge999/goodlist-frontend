"use client";

import { Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PrivacyPolicyModalProps {
  showPrivacyPolicy: boolean;
  setShowPrivacyPolicy: Dispatch<SetStateAction<boolean>>;
  setAcceptedPrivacyPolicy?: Dispatch<SetStateAction<boolean>>;
}

export default function PrivacyPolicyModal({
  showPrivacyPolicy,
  setShowPrivacyPolicy,
  setAcceptedPrivacyPolicy,
}: PrivacyPolicyModalProps) {
  return (
    <Dialog open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy} aria-label="นโยบายความเป็นส่วนตัว">
      <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            นโยบายความเป็นส่วนตัว
          </DialogTitle>
          <DialogDescription id="privacy-description" className="sr-only">
            นโยบายความเป็นส่วนตัวของเว็บไซต์ Goodlistseller.com ที่ผู้ใช้บริการต้องยอมรับ
          </DialogDescription>
        </DialogHeader>

        <div className="prose max-w-none text-gray-700 space-y-6 my-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900">
              เว็บไซต์: Goodlistseller.com
            </h3>
            <p className="text-gray-600 mt-2">
              มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2023
            </p>
          </div>
          
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              บทนำ
            </h3>
            <p className="leading-relaxed">
              Goodlistseller.com (&quot;เรา&quot;, &quot;ของเรา&quot;, หรือ &quot;เว็บไซต์&quot;) ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้บริการ 
              นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีที่เราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่าน 
              เมื่อท่านเข้าใช้งานเว็บไซต์ของเรา การใช้บริการของเราถือว่าท่านยอมรับนโยบายความเป็นส่วนตัวนี้
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              ข้อมูลที่เราเก็บรวบรวม
            </h3>
            <p className="leading-relaxed mb-2">
              เราอาจเก็บรวบรวมข้อมูลต่อไปนี้เกี่ยวกับท่าน:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ข้อมูลส่วนบุคคล:</strong> เช่น ชื่อ นามสกุล อีเมล หมายเลขโทรศัพท์ ที่อยู่ และข้อมูลการติดต่ออื่นๆ</li>
              <li><strong>ข้อมูลการลงทะเบียน:</strong> ข้อมูลที่ท่านให้เมื่อสร้างบัญชีผู้ใช้หรือลงทะเบียนร้านค้า</li>
              <li><strong>ข้อมูลธุรกรรม:</strong> รายละเอียดเกี่ยวกับการทำธุรกรรมที่ท่านดำเนินการผ่านเว็บไซต์ (หากมี)</li>
              <li><strong>ข้อมูลทางเทคนิค:</strong> ที่อยู่ IP ข้อมูลการเข้าถึง ประเภทและเวอร์ชันของเบราว์เซอร์ การตั้งค่าเขตเวลา คุกกี้</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              นโยบายข้อมูลส่วนบุคคล (PDPA)
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>ผู้ใช้บริการยินยอมให้เว็บไซต์เก็บข้อมูลส่วนบุคคลเพื่อวัตถุประสงค์ในการระบุตัวตน ตรวจสอบการใช้งาน และช่วยในการแก้ไขข้อพิพาท</li>
              <li>ข้อมูลของผู้ใช้งานจะไม่ถูกเปิดเผยแก่บุคคลที่สาม ยกเว้นในกรณีที่มีคำสั่งตามกฎหมาย หรือเพื่อการปกป้องสิทธิของผู้เสียหาย</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              การเปิดเผยข้อมูล
            </h3>
            <p className="leading-relaxed mb-2">
              เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลที่สาม ยกเว้นในกรณีต่อไปนี้:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>เมื่อได้รับความยินยอมจากท่าน</li>
              <li>เมื่อมีคำสั่งตามกฎหมายหรือกระบวนการทางกฎหมาย</li>
              <li>เพื่อปกป้องสิทธิ ทรัพย์สิน หรือความปลอดภัยของ Goodlistseller.com ผู้ใช้งาน หรือสาธารณะ</li>
              <li>ในกรณีที่มีการร้องเรียนเกี่ยวกับร้านค้าที่มีพฤติกรรมฉ้อโกงหรือผิดกฎหมาย</li>
            </ul>
          </section>

          <div className="text-sm text-gray-600 mt-6">
            สำหรับรายละเอียดเพิ่มเติมเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาเยี่ยมชม{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              หน้านโยบายความเป็นส่วนตัวฉบับเต็ม
            </Link>
          </div>
        </div>

        <DialogFooter>
          {setAcceptedPrivacyPolicy ? (
            <Button
              variant="primary"
              onClick={() => {
                setAcceptedPrivacyPolicy(true);
                setShowPrivacyPolicy(false);
              }}
              className="w-full sm:w-auto cursor-pointer"
            >
              ยอมรับนโยบายความเป็นส่วนตัว
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setShowPrivacyPolicy(false);
              }}
              className="w-full sm:w-auto cursor-pointer"
            >
              ปิด
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 