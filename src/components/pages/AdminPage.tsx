"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faTimesCircle, 
  faBars, 
  faExclamationTriangle,
  faFileAlt,
  faUser,
  faCalendar,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { mockStores, mockAdminUser, mockReports } from "@/data/mockData";
import { updateMockData } from "@/utils/mockDataUtils";

// Define types
type Store = {
  id: string;
  store_name: string;
  description?: string;
  contact_info: string;
  image_url?: string;
  is_verified: boolean;
  is_banned: boolean;
  is_additional_store?: boolean;
  created_at: string;
  updated_at?: string;
};

type Report = {
  id: string;
  store_id: string;
  reason: string;
  evidence_url: string;
  created_at: string;
  status: "pending" | "valid" | "invalid";
};

type User = {
  id: number;
  name: string;
  role: string;
};

type Tab = {
  id: string;
  name: string;
  count: number;
};

interface SelectedReport {
  store: Store;
  reports: Report[];
}

export default function AdminPage() {
  const { user } = useAuth() as { user: User | null };
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReport, setSelectedReport] = useState<SelectedReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);

  const tabs: Tab[] = [
    {
      id: "pending",
      name: "ร้านค้าที่รอการตรวจสอบ",
      count: mockStores.filter((s) => !s.is_verified && !s.is_banned).length,
    },
    {
      id: "reported",
      name: "ร้านค้าที่ถูกรายงาน",
      count: mockReports.length,
    },
    {
      id: "verified",
      name: "ร้านค้าที่ตรวจสอบแล้ว",
      count: mockStores.filter((s) => s.is_verified && !s.is_banned).length,
    },
    {
      id: "additional",
      name: "คำขอเพิ่มร้านค้า",
      count: mockStores.filter(
        (s) => s.is_additional_store && !s.is_verified && !s.is_banned
      ).length,
    },
    {
      id: "banned",
      name: "ร้านค้าที่ถูกแบน",
      count: mockStores.filter((s) => s.is_banned).length,
    },
  ];

  const filteredStores = mockStores.filter((store) => {
    switch (activeTab) {
      case "pending":
        return !store.is_verified && !store.is_banned;
      case "reported":
        return mockReports.some((report) => report.store_id === store.id);
      case "verified":
        return store.is_verified && !store.is_banned;
      case "additional":
        return (
          store.is_additional_store && !store.is_verified && !store.is_banned
        );
      case "banned":
        return store.is_banned;
      default:
        return true;
    }
  });

  const getStoreReports = (storeId: string): Report[] => {
    return mockReports.filter((report) => report.store_id === storeId);
  };

  const handleViewReport = (store: Store) => {
    const reports = getStoreReports(store.id);
    setSelectedReport({ store, reports });
    setIsReportModalOpen(true);
  };

  const handleUpdateReportStatus = (reportId: string, newStatus: "valid" | "invalid") => {
    const report = mockReports.find((r) => r.id === reportId);
    if (report) {
      report.status = newStatus;
      // Force a re-render
      setSelectedReport({ ...selectedReport! });
    }
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
    setIsReportModalOpen(false);
  };

  const handleApproveStore = (storeId: string) => {
    updateMockData.updateStore(storeId, {
      is_verified: true,
      updated_at: new Date().toISOString(),
    });
    setForceUpdate((prev) => prev + 1);
  };

  const handleRejectStore = (storeId: string) => {
    updateMockData.deleteStore(storeId);
    setForceUpdate((prev) => prev + 1);
  };

  const handleBanStore = (storeId: string) => {
    updateMockData.updateStore(storeId, {
      is_banned: true,
      is_verified: false,
      updated_at: new Date().toISOString(),
    });
    setForceUpdate((prev) => prev + 1);
  };

  const handleViewStore = (store: Store) => {
    setSelectedStore(store);
    setIsStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setSelectedStore(null);
    setIsStoreModalOpen(false);
  };

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    setIsLoading(false);
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">
              จัดการร้านค้า
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              จัดการสถานะและตรวจสอบร้านค้าทั้งหมด
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  {tab.name}
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul role="list" className="divide-y divide-gray-200">
                {filteredStores.map((store) => (
                  <li key={store.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
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
                          <div className="ml-4">
                            <button
                              onClick={() => handleViewStore(store)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                              {store.store_name}
                            </button>
                            <p className="text-xs text-gray-500">
                              {JSON.parse(store.contact_info).line}
                            </p>
                            {store.is_additional_store && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                คำขอเพิ่มร้านค้า
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex space-x-2">
                          {activeTab === "reported" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReport(store)}
                              className="text-yellow-600 hover:text-yellow-700 border-yellow-600 hover:border-yellow-700 hover:bg-yellow-50"
                            >
                              <FontAwesomeIcon icon={faExclamationTriangle} className="w-4 h-4 mr-1" />
                              ดูรายละเอียด
                            </Button>
                          )}
                          {!store.is_verified && !store.is_banned && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveStore(store.id)}
                                className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 hover:bg-green-50"
                              >
                                <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                                อนุมัติ
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectStore(store.id)}
                                className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 hover:bg-red-50"
                              >
                                <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                                ปฏิเสธ
                              </Button>
                            </>
                          )}
                          {store.is_verified && !store.is_banned && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBanStore(store.id)}
                              className="text-red-600 hover:text-red-700 border-red-600 hover:border-red-700 hover:bg-red-50"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                              แบนร้านค้า
                            </Button>
                          )}
                          {store.is_banned && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateMockData.updateStore(store.id, {
                                  is_banned: false,
                                  updated_at: new Date().toISOString(),
                                });
                                setForceUpdate((prev) => prev + 1);
                              }}
                              className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700 hover:bg-green-50"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                              ยกเลิกแบน
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
                {filteredStores.length === 0 && (
                  <li className="px-4 py-8 text-center text-gray-500">
                    ไม่พบร้านค้าในหมวดหมู่นี้
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Store Details Modal */}
      <Dialog open={isStoreModalOpen} onOpenChange={(open) => !open && handleCloseStoreModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">ข้อมูลร้านค้า</DialogTitle>
          </DialogHeader>
          {selectedStore && (
            <div className="space-y-6 my-4">
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      selectedStore.image_url ||
                      "/images/stores/default-store.jpg"
                    }
                    alt={selectedStore.store_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedStore.store_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedStore.is_verified && (
                      <Badge variant="success">
                        <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                        ยืนยันแล้ว
                      </Badge>
                    )}
                    {selectedStore.is_banned && (
                      <Badge variant="destructive">
                        <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                        ถูกแบน
                      </Badge>
                    )}
                    {selectedStore.is_additional_store && (
                      <Badge variant="outline">คำขอเพิ่มร้านค้า</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 text-gray-500" />
                  รายละเอียด
                </h4>
                <p className="mt-1 text-gray-600">{selectedStore.description || "ไม่มีคำอธิบาย"}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-500" />
                  ข้อมูลการติดต่อ
                </h4>
                <div className="mt-1 space-y-2">
                  {Object.entries(JSON.parse(selectedStore.contact_info)).map(
                    ([key, value]) => (
                      <p key={key} className="text-gray-600">
                        <span className="capitalize">{key}:</span>{" "}
                        <span className="font-medium">{value as string}</span>
                      </p>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-gray-500" />
                    วันที่สร้าง
                  </h4>
                  <p className="mt-1 text-gray-600">
                    {formatDate(selectedStore.created_at)}
                  </p>
                </div>
                {selectedStore.updated_at && (
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendar} className="w-4 h-4 text-gray-500" />
                      วันที่อัปเดต
                    </h4>
                    <p className="mt-1 text-gray-600">
                      {formatDate(selectedStore.updated_at)}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6">
                {!selectedStore.is_verified && !selectedStore.is_banned && (
                  <>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => {
                        handleApproveStore(selectedStore.id);
                        handleCloseStoreModal();
                      }}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                      อนุมัติ
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        handleRejectStore(selectedStore.id);
                        handleCloseStoreModal();
                      }}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-2" />
                      ปฏิเสธ
                    </Button>
                  </>
                )}
                {selectedStore.is_verified && !selectedStore.is_banned && (
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleBanStore(selectedStore.id);
                      handleCloseStoreModal();
                    }}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-2" />
                    แบนร้านค้า
                  </Button>
                )}
                {selectedStore.is_banned && (
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => {
                      updateMockData.updateStore(selectedStore.id, {
                        is_banned: false,
                        updated_at: new Date().toISOString(),
                      });
                      setForceUpdate((prev) => prev + 1);
                      handleCloseStoreModal();
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                    ยกเลิกแบน
                  </Button>
                )}
                <Button onClick={handleCloseStoreModal}>ปิด</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reports Modal */}
      <Dialog open={isReportModalOpen} onOpenChange={(open) => !open && handleCloseReport()}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">รายงานร้านค้า</DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-medium">{selectedReport.store.store_name}</span>
                  <span className="text-gray-500">·</span>
                  <span>
                    มีทั้งหมด {selectedReport.reports.length} รายงาน
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="my-4 space-y-6">
              {selectedReport.reports.map((report) => (
                <div key={report.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between mb-4">
                    <span className="text-sm text-gray-500">
                      รายงานเมื่อ {formatDate(report.created_at)}
                    </span>
                    <div>
                      {report.status === "pending" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          รอดำเนินการ
                        </span>
                      ) : report.status === "valid" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FontAwesomeIcon icon={faCheckCircle} className="w-3 h-3 mr-1" />
                          ยืนยันแล้ว
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FontAwesomeIcon icon={faTimesCircle} className="w-3 h-3 mr-1" />
                          ไม่ถูกต้อง
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">เหตุผล:</h4>
                      <p className="mt-1 text-gray-900">{report.reason}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">หลักฐาน:</h4>
                      <div className="mt-2">
                        <a
                          href={report.evidence_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <FontAwesomeIcon icon={faFileAlt} className="w-4 h-4 mr-1" />
                          ดูหลักฐาน
                        </a>
                      </div>
                    </div>
                    {report.status === "pending" && (
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-600 hover:bg-green-50"
                          onClick={() => handleUpdateReportStatus(report.id, "valid")}
                        >
                          <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-1" />
                          ยืนยัน
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleUpdateReportStatus(report.id, "invalid")}
                        >
                          <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-1" />
                          ปฏิเสธ
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleBanStore(selectedReport.store.id);
                    handleCloseReport();
                  }}
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="w-4 h-4 mr-2" />
                  แบนร้านค้า
                </Button>
                <Button onClick={handleCloseReport}>ปิด</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 