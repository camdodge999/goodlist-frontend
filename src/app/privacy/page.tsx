import { Metadata } from 'next';
import ContentWidth from "@/components/layout/ContentWidth";
import { Footer } from "@/components/layout/Footer";  

export const metadata: Metadata = {
  title: 'นโยบายความเป็นส่วนตัว | Goodlistseller',
  description: 'นโยบายความเป็นส่วนตัวของ Goodlistseller - แพลตฟอร์มร้านค้าออนไลน์ที่น่าเชื่อถือในประเทศไทย',
};

export default function PrivacyPage() {
  return (
    <>
      <div className="bg-gray-50 py-16 min-h-[calc(100vh-440px)]">
        <ContentWidth>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">นโยบายความเป็นส่วนตัว</h1>
            
            <div className="bg-white shadow-md rounded-lg p-8">
              <div className="prose max-w-none text-gray-700 space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    เว็บไซต์: Goodlistseller.com
                  </h2>
                  <p className="text-gray-600 mt-2">
                    มีผลบังคับใช้ตั้งแต่วันที่ 1 มกราคม 2023
                  </p>
                </div>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    บทนำ
                  </h3>
                  <p className="leading-relaxed">
                    Goodlistseller.com ("เรา", "ของเรา", หรือ "เว็บไซต์") ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้บริการ 
                    นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีที่เราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่าน 
                    เมื่อท่านเข้าใช้งานเว็บไซต์ของเรา การใช้บริการของเราถือว่าท่านยอมรับนโยบายความเป็นส่วนตัวนี้
                  </p>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    ข้อมูลที่เราเก็บรวบรวม
                  </h3>
                  <p className="leading-relaxed mb-4">
                    เราอาจเก็บรวบรวมข้อมูลต่อไปนี้เกี่ยวกับท่าน:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>ข้อมูลส่วนบุคคล:</strong> เช่น ชื่อ นามสกุล อีเมล หมายเลขโทรศัพท์ ที่อยู่ และข้อมูลการติดต่ออื่นๆ</li>
                    <li><strong>ข้อมูลการลงทะเบียน:</strong> ข้อมูลที่ท่านให้เมื่อสร้างบัญชีผู้ใช้หรือลงทะเบียนร้านค้า</li>
                    <li><strong>ข้อมูลธุรกรรม:</strong> รายละเอียดเกี่ยวกับการทำธุรกรรมที่ท่านดำเนินการผ่านเว็บไซต์ (หากมี)</li>
                    <li><strong>ข้อมูลทางเทคนิค:</strong> ที่อยู่ IP ข้อมูลการเข้าถึง ประเภทและเวอร์ชันของเบราว์เซอร์ การตั้งค่าเขตเวลา คุกกี้</li>
                  </ul>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    วิธีการเก็บรวบรวมข้อมูล
                  </h3>
                  <p className="leading-relaxed mb-4">
                    เราเก็บรวบรวมข้อมูลของท่านผ่านช่องทางต่อไปนี้:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>เมื่อท่านกรอกแบบฟอร์มบนเว็บไซต์ของเรา</li>
                    <li>เมื่อท่านลงทะเบียนหรือสร้างบัญชีผู้ใช้</li>
                    <li>เมื่อท่านติดต่อเราผ่านช่องทางต่างๆ</li>
                    <li>โดยอัตโนมัติผ่านคุกกี้และเทคโนโลยีการติดตามอื่นๆ</li>
                  </ul>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    วัตถุประสงค์ในการใช้ข้อมูล
                  </h3>
                  <p className="leading-relaxed mb-4">
                    เราใช้ข้อมูลของท่านเพื่อวัตถุประสงค์ดังต่อไปนี้:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>เพื่อระบุตัวตนและยืนยันความถูกต้องของข้อมูลร้านค้า</li>
                    <li>เพื่อจัดการบัญชีผู้ใช้และให้บริการแก่ท่าน</li>
                    <li>เพื่อตรวจสอบการใช้งานและป้องกันการฉ้อโกง</li>
                    <li>เพื่อช่วยในการแก้ไขข้อพิพาทระหว่างผู้ใช้งานและร้านค้า</li>
                    <li>เพื่อปรับปรุงและพัฒนาเว็บไซต์และบริการของเรา</li>
                    <li>เพื่อส่งการแจ้งเตือนและข้อมูลสำคัญเกี่ยวกับบัญชีของท่าน</li>
                  </ul>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    การเปิดเผยข้อมูล
                  </h3>
                  <p className="leading-relaxed mb-4">
                    เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลที่สาม ยกเว้นในกรณีต่อไปนี้:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>เมื่อได้รับความยินยอมจากท่าน</li>
                    <li>เมื่อมีคำสั่งตามกฎหมายหรือกระบวนการทางกฎหมาย</li>
                    <li>เพื่อปกป้องสิทธิ ทรัพย์สิน หรือความปลอดภัยของ Goodlistseller.com ผู้ใช้งาน หรือสาธารณะ</li>
                    <li>ในกรณีที่มีการร้องเรียนเกี่ยวกับร้านค้าที่มีพฤติกรรมฉ้อโกงหรือผิดกฎหมาย เราอาจเปิดเผยข้อมูลให้กับหน่วยงานที่เกี่ยวข้อง เช่น ตำรวจ, กสทช., DSI หากมีคำร้องอย่างเป็นทางการ</li>
                  </ul>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    การรักษาความปลอดภัยของข้อมูล
                  </h3>
                  <p className="leading-relaxed">
                    เราใช้มาตรการรักษาความปลอดภัยทางเทคนิคและทางกายภาพที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของท่านจากการสูญหาย การเข้าถึงโดยไม่ได้รับอนุญาต การเปิดเผย การเปลี่ยนแปลง หรือการทำลาย 
                    อย่างไรก็ตาม ไม่มีวิธีการส่งข้อมูลผ่านอินเทอร์เน็ตหรือการจัดเก็บข้อมูลอิเล็กทรอนิกส์ที่ปลอดภัย 100% เราไม่สามารถรับประกันความปลอดภัยของข้อมูลที่ท่านส่งให้เราได้อย่างสมบูรณ์
                  </p>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    สิทธิของท่าน
                  </h3>
                  <p className="leading-relaxed mb-4">
                    ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 ท่านมีสิทธิดังต่อไปนี้เกี่ยวกับข้อมูลส่วนบุคคลของท่าน:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>สิทธิในการเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลของท่าน</li>
                    <li>สิทธิในการแก้ไขข้อมูลส่วนบุคคลที่ไม่ถูกต้อง</li>
                    <li>สิทธิในการลบหรือทำลายข้อมูลส่วนบุคคล</li>
                    <li>สิทธิในการจำกัดการใช้ข้อมูลส่วนบุคคล</li>
                    <li>สิทธิในการคัดค้านการเก็บรวบรวม ใช้ หรือเปิดเผยข้อมูลส่วนบุคคล</li>
                    <li>สิทธิในการเพิกถอนความยินยอม</li>
                  </ul>
                  <p className="leading-relaxed mt-4">
                    หากท่านต้องการใช้สิทธิใดๆ ข้างต้น โปรดติดต่อเราตามรายละเอียดในส่วน "การติดต่อเรา"
                  </p>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    คุกกี้และเทคโนโลยีการติดตาม
                  </h3>
                  <p className="leading-relaxed">
                    เราใช้คุกกี้และเทคโนโลยีการติดตามอื่นๆ เพื่อปรับปรุงประสบการณ์การใช้งานเว็บไซต์ของท่าน วิเคราะห์การใช้งานเว็บไซต์ และช่วยในการตลาดของเรา 
                    ท่านสามารถควบคุมการใช้คุกกี้ได้ผ่านการตั้งค่าเบราว์เซอร์ของท่าน อย่างไรก็ตาม การปิดใช้งานคุกกี้อาจส่งผลต่อฟังก์ชันการทำงานบางอย่างของเว็บไซต์
                  </p>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    การติดต่อเรา
                  </h3>
                  <p className="leading-relaxed">
                    หากท่านมีคำถามหรือข้อกังวลเกี่ยวกับนโยบายความเป็นส่วนตัวนี้หรือวิธีการที่เราจัดการกับข้อมูลส่วนบุคคลของท่าน 
                    โปรดติดต่อเราที่ช่องทาง "Adminchat" บนเว็บไซต์ หรืออีเมล goodlistseller@gmail.com
                  </p>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    การเปลี่ยนแปลงนโยบายความเป็นส่วนตัว
                  </h3>
                  <p className="leading-relaxed">
                    เราอาจปรับปรุงนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว โดยจะแจ้งให้ท่านทราบผ่านการประกาศบนเว็บไซต์ของเรา 
                    การที่ท่านยังคงใช้บริการของเราหลังจากการเปลี่ยนแปลงดังกล่าวถือว่าท่านยอมรับนโยบายความเป็นส่วนตัวฉบับแก้ไขแล้ว
                  </p>
                </section>
              </div>
            </div>
          </div>
        </ContentWidth>
      </div>
      <Footer />
    </>
  );
} 