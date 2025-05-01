"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faExclamationTriangle, 
  faMagnifyingGlass
} from '@fortawesome/free-solid-svg-icons';

import { cn } from "@/lib/utils";
import { mockStores, mockReports } from "@/data/mockData";

// Define types
type Store = {
  id: string;
  store_name: string;
  contact_info: string;
  image_url?: string;
  is_verified: boolean;
  is_banned: boolean;
};

type Report = {
  id: string;
  store_id: string;
  reason: string;
  evidence_url: string;
  created_at: string;
  status: "pending" | "valid" | "invalid";
};

export default function ReportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter stores based on search query
  const filteredStores = mockStores.filter(
    (store) =>
      (store.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.contact_info.toLowerCase().includes(searchQuery.toLowerCase())) &&
      store.is_verified && // Only show verified stores
      !store.is_banned // Don't show banned stores
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("ไฟล์มีขนาดใหญ่เกินไป กรุณาอัพโหลดไฟล์ขนาดไม่เกิน 10MB");
        return;
      }
      // Check file type
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setError("รองรับเฉพาะไฟล์ PNG, JPG และ PDF เท่านั้น");
        return;
      }
      setEvidenceFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!selectedStore) {
      setError("กรุณาเลือกร้านค้า");
      return;
    }
    if (!reportReason.trim()) {
      setError("กรุณาระบุเหตุผลในการรายงาน");
      return;
    }
    if (!evidenceFile) {
      setError("กรุณาอัพโหลดหลักฐาน");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create new report
      const newReport = {
        id: Date.now().toString(),
        store_id: selectedStore.id,
        reason: reportReason,
        evidence_url: URL.createObjectURL(evidenceFile),
        created_at: new Date().toISOString(),
        status: "pending" as const,
      };

      // Add to mockReports
      mockReports.push(newReport);

      // Show success message
      alert("ส่งรายงานเรียบร้อยแล้ว");

      // Reset form
      setSelectedStore(null);
      setSearchQuery("");
      setReportReason("");
      setEvidenceFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Redirect to home page
      router.push("/");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faExclamationTriangle} className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                รายงานร้านค้า
              </h1>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              กรอกข้อมูลเพื่อรายงานร้านค้าที่มีพฤติกรรมไม่เหมาะสม
            </p>
          </div>

          <form
            className="border-t border-gray-200 px-4 py-5 sm:px-6"
            onSubmit={handleSubmit}
          >
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="store"
                    className="block text-sm font-medium text-gray-700 flex items-center"
                  >
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      1
                    </span>
                    เลือกร้านค้า
                  </label>
                  <span className="text-xs text-gray-500">* จำเป็น</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  ค้นหาและเลือกร้านค้าที่ต้องการรายงาน
                </p>
                <div className="mt-1 relative">
                  <div className="relative">
                    <input
                      type="text"
                      className="block w-full p-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pr-10"
                      placeholder="พิมพ์ชื่อร้านค้า หรือ Line ID..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <FontAwesomeIcon icon={faMagnifyingGlass} className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200">
                      {filteredStores.length > 0 ? (
                        filteredStores.map((store) => (
                          <div
                            key={store.id}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50",
                              selectedStore?.id === store.id && "bg-blue-50"
                            )}
                            onClick={() => {
                              setSelectedStore(store);
                              setSearchQuery(store.store_name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={
                                  store.image_url ||
                                  "/images/stores/default-store.jpg"
                                }
                                alt={store.store_name}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {store.store_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {JSON.parse(store.contact_info).line}
                              </p>
                            </div>
                            {store.is_verified && (
                              <div className="flex-shrink-0">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  ยืนยันแล้ว
                                </span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          ไม่พบร้านค้าที่ค้นหา
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 flex items-center"
                  >
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      2
                    </span>
                    เหตุผล
                  </label>
                  <span className="text-xs text-gray-500">* จำเป็น</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  ระบุเหตุผลที่คุณต้องการรายงานร้านค้านี้
                </p>
                <textarea
                  rows={4}
                  name="reason"
                  id="reason"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="อธิบายรายละเอียดของปัญหาที่คุณพบ..."
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="evidence"
                    className="block text-sm font-medium text-gray-700 flex items-center"
                  >
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                      3
                    </span>
                    แนบหลักฐาน
                  </label>
                  <span className="text-xs text-gray-500">* จำเป็น</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  อัพโหลดรูปภาพหรือเอกสารที่แสดงถึงการกระทำที่ไม่เหมาะสม
                </p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>อัพโหลดไฟล์</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">หรือลากและวางที่นี่</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF ขนาดไม่เกิน 10MB
                    </p>
                    {evidenceFile && (
                      <p className="text-sm text-green-600 font-medium">
                        {evidenceFile.name} (
                        {(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting && "opacity-75 cursor-not-allowed"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "กำลังส่งรายงาน..." : "ส่งรายงาน"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 