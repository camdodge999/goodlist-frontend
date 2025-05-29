import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faMagnifyingGlass, faHome, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

export default function StoreNotFoundCard() {
  return (
    <div className="space-y-4 sm:space-y-6 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3 sm:gap-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/stores">ร้านค้า</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>ไม่พบร้านค้า</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-6 py-5 sm:px-8 bg-gradient-to-r from-orange-50 to-white text-center">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500"
                />
              </div>
              <div className="flex flex-col items-center sm:items-start gap-1 sm:gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  ไม่พบร้านค้า
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  ขออภัย ไม่พบร้านค้าที่คุณกำลังมองหา
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 text-center border-t border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="mb-4 sm:mb-6">
                <FontAwesomeIcon
                  icon={faStore}
                  className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-300 mb-3 sm:mb-4"
                />
                <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 mb-2">
                  ร้านค้าอาจถูกลบหรือไม่มีอยู่
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed px-2 sm:px-0">
                  ร้านค้าที่คุณกำลังมองหาอาจถูกลบออกจากระบบแล้ว
                  หรือลิงก์ที่คุณใช้อาจไม่ถูกต้อง
                </p>
              </div>

              {/* Suggestions */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-2 sm:mb-3">
                  คุณสามารถลองทำสิ่งเหล่านี้:
                </h3>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>ตรวจสอบลิงก์ที่คุณใช้ว่าถูกต้องหรือไม่</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>ค้นหาร้านค้าในหน้ารายการร้านค้าทั้งหมด</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 flex-shrink-0">•</span>
                    <span>ติดต่อเจ้าของร้านค้าโดยตรง</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <Link href="/stores" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full sm:w-auto gap-2 text-sm sm:text-base">
                  <FontAwesomeIcon icon={faSearch} className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>ดูร้านค้าทั้งหมด</span>
                </Button>
              </Link>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto gap-2 text-sm sm:text-base">
                  <FontAwesomeIcon icon={faHome} className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>กลับหน้าหลัก</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 