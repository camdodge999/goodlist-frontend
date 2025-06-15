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
    <Dialog open={showTerms} onOpenChange={setShowTerms} aria-label="ข้อกำหนดและเงื่อนไขการใช้งาน">
      <DialogContent className="max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">
            ข้อกำหนดและเงื่อนไขการใช้งาน
          </DialogTitle>
          <DialogDescription id="terms-description" className="sr-only">
          ข้อกำหนดและเงื่อนไขการใช้งานเว็บไซต์ Goodlistseller.com ที่ผู้ใช้บริการต้องยอมรับ
          </DialogDescription>
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

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              ผู้ใช้บริการ (User)
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>ผู้ใช้บริการต้องกรอกข้อมูลส่วนตัวตามความเป็นจริงเท่านั้น หากพบว่าข้อมูลเป็นเท็จ เว็บไซต์มีสิทธิ์ระงับบัญชีผู้ใช้งานทันทีโดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
              <li>หากมีการเปลี่ยนแปลงข้อมูลส่วนตัวใด ๆ ให้ผู้ใช้บริการดำเนินการแก้ไขผ่านระบบหลังบ้านด้วยตนเอง</li>
              <li>ผู้ใช้บริการจะต้องรับผิดชอบต่อข้อมูลที่นำเข้าด้วยตนเองทั้งหมด โดยยืนยันว่าได้รับความยินยอมจากบุคคลที่เกี่ยวข้อง (หากมี) ก่อนนำเข้า</li>
              <li>ห้ามผู้ใช้บริการกระทำการใด ๆ ที่เข้าข่ายหมิ่นประมาท ข่มขู่ ใส่ร้าย ปลุกปั่น หรือเปิดเผยข้อมูลส่วนบุคคลของบุคคลที่สามโดยไม่ได้รับอนุญาต รวมถึงการใช้ภาษาหยาบคายหรือไม่เหมาะสมทุกกรณี</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              กรณีร้านค้ากระทำผิด / ฉ้อโกง
            </h3>
            <p className="leading-relaxed mb-2">
              ผู้ใช้บริการที่ลงทะเบียนในฐานะ &quot;ร้านค้า&quot; ยอมรับว่า หากมีพฤติกรรมที่เข้าข่าย ฉ้อโกง, หลอกลวง, ผิดกฎหมาย หรือสร้างความเสียหายให้แก่ผู้ซื้อ/ผู้เยี่ยมชมเว็บไซต์ ทาง Goodlistseller.com ขอสงวนสิทธิ์ในการ:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>ระงับบัญชีของร้านค้านั้นทันที โดยไม่ต้องแจ้งให้ทราบล่วงหน้า</li>
              <li>ขึ้นสถานะ &quot;ร้านค้าถูกระงับ&quot; หรือ &quot;ร้านค้าน่าสงสัย&quot; บนเว็บไซต์</li>
              <li>เปิดเผยข้อมูลให้กับหน่วยงานที่เกี่ยวข้องตามกฎหมาย (เช่น ตำรวจ, กสทช., DSI) หากมีคำร้องอย่างเป็นทางการ</li>
              <li>ลบข้อมูลร้านค้าหรือรายงานที่ไม่เหมาะสมโดยไม่จำเป็นต้องอธิบายเหตุผล</li>
            </ul>
            <p className="leading-relaxed mt-2">
              ความเสียหายที่เกิดขึ้นจากการกระทำของร้านค้า จะเป็นความรับผิดชอบของร้านค้านั้นโดยตรงเพียงผู้เดียว Goodlistseller.com ไม่มีหน้าที่รับผิดชอบร่วมในธุรกรรมใด ๆ ระหว่างร้านค้าและผู้ซื้อ
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              การรายงาน / ระบบร้องเรียน
            </h3>
            <p className="leading-relaxed">
              เว็บไซต์มีระบบสำหรับผู้ใช้บริการสามารถแจ้งรายงานร้านค้าที่มีพฤติกรรมน่าสงสัย พร้อมแนบหลักฐาน เช่น สลิป, แชท, รูปภาพ ผ่านหน้าเว็บไซต์ โดยทีมงานจะตรวจสอบความถูกต้อง และดำเนินการตามความเหมาะสม
            </p>
            <p className="leading-relaxed">
              หากมีหลักฐานไม่ชัดเจนหรือข้อมูลไม่ตรงกับระบบ เว็บไซต์ขอสงวนสิทธิ์ในการลบหรือเพิกถอนรายงานดังกล่าวโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              ผู้ให้บริการ (Service Provider)
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Goodlistseller.com เป็นเพียงสื่อกลางที่ให้ร้านค้าแสดงข้อมูลเพื่อสร้างความน่าเชื่อถือเบื้องต้น ไม่ใช่ผู้ซื้อ-ขายโดยตรง</li>
              <li>ผู้ให้บริการสามารถปรับเปลี่ยนเงื่อนไขต่าง ๆ ได้ทุกเมื่อโดยไม่จำเป็นต้องแจ้งให้ทราบล่วงหน้า การที่ผู้ใช้ยังคงใช้งานเว็บไซต์ถือว่าท่านยอมรับการเปลี่ยนแปลงนั้นแล้วโดยสมบูรณ์</li>
              <li>ระบบจะมีการตรวจสอบชื่อร้านค้าและบัญชีที่ใช้ เพื่อความปลอดภัยของผู้ใช้งาน เช่น การเปรียบเทียบกับหลักฐานใบเสร็จ หรือป้องกันการปลอมแปลง</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
              การปฏิเสธความรับผิด (Disclaimer Policy)
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>ผู้ให้บริการไม่รับรองหรือรับประกันความถูกต้อง ความน่าเชื่อถือ หรือความครบถ้วนของข้อมูลที่ผู้ใช้บริการนำเข้ามา</li>
              <li>ข้อมูลทั้งหมดบนเว็บไซต์นี้แสดงผล &quot;ตามสภาพ&quot; และ &quot;เท่าที่มี&quot; โดยระบบอัตโนมัติ</li>
              <li>Goodlistseller.com จะไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดขึ้น ไม่ว่าจะเป็นโดยตรงหรือโดยอ้อม จากการใช้บริการหรือการตัดสินใจซื้อขายของผู้ใช้งาน</li>
              <li>แม้ร้านค้าจะผ่านการตรวจสอบเบื้องต้น เว็บไซต์ไม่สามารถรับประกันได้ว่าร้านค้าดังกล่าวจะไม่กระทำผิดในภายหลัง</li>
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
              การติดต่อ / ร้องเรียน
            </h3>
            <span className="leading-relaxed">
              สามารถติดต่อแอดมินได้ที่ช่องทาง &quot;ติดต่อเรา&quot; บนเว็บไซต์
            </span>
            <p className="leading-relaxed">
              ทุกคำร้องเรียนจะได้รับการพิจารณาโดยเร็วที่สุด
            </p>
          </section>

          <div className="text-sm text-gray-600 mt-6">
            {/* การกดยอมรับหมายถึงผู้ใช้บริการยินยอมตามนโยบาย พ.ร.บ. */}
            {/* คุ้มครองข้อมูลส่วนบุคคล โดยมีรายละเอียดในลิงก์นี้ */}
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