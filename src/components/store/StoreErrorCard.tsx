import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle, faRedo, faHome, faSearch } from "@fortawesome/free-solid-svg-icons";
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

interface StoreErrorCardProps {
  error: string;
  onRetry?: () => void;
}

export default function StoreErrorCard({ error, onRetry }: StoreErrorCardProps) {
  return (
    <div className="space-y-6 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/stores">ร้านค้า</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>เกิดข้อผิดพลาด</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 bg-gradient-to-r from-red-50 to-white">
            <div className="flex flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-red-100 flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="w-12 h-12 text-red-500 text-2xl"
                />
              </div>
              <div className="flex flex-col items-center sm:items-start gap-1 sm:gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  เกิดข้อผิดพลาด
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  ไม่สามารถโหลดข้อมูลร้านค้าได้ในขณะนี้
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 sm:px-8 text-center border-t border-gray-200">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                  รายละเอียดข้อผิดพลาด
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm font-mono break-words">
                    {error}
                  </p>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">
                  เกิดข้อผิดพลาดในการโหลดข้อมูลร้านค้า
                  กรุณาลองใหม่อีกครั้งหรือติดต่อผู้ดูแลระบบ
                </p>
              </div>

              {/* Suggestions */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-700 mb-3">
                  คุณสามารถลองทำสิ่งเหล่านี้:
                </h3>
                <ul className="text-sm text-gray-600 space-y-2 text-left">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    รีเฟรชหน้าเว็บหรือลองใหม่อีกครั้ง
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    ลองเข้าชมร้านค้าอื่นๆ ในระบบ
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    ติดต่อผู้ดูแลระบบหากปัญหายังคงอยู่
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-5 sm:px-8 bg-gray-50">
            <div className="flex justify-center gap-3">
              {onRetry && (
                <Button variant="primary" className="gap-2" onClick={onRetry}>
                  <FontAwesomeIcon icon={faRedo} className="w-4 h-4" />
                  <span>ลองใหม่</span>
                </Button>
              )}
              <Link href="/stores">
                <Button variant="outline" className="gap-2">
                  <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                  <span>ดูร้านค้าทั้งหมด</span>
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
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