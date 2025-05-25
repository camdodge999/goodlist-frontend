"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Eye } from 'lucide-react';    
import { Store } from '@/types/stores';
import { getAuthenticatedImageUrl } from '@/lib/utils';
import defaultImage from '@images/logo.webp';
import DocumentPreviewDialog from './DocumentPreviewDialog';
import { Button } from '../ui/button';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from "dayjs/plugin/buddhistEra"
import { useSession } from 'next-auth/react';
import { isValidJSON } from '@/utils/valid-json';
import { StoreDocument } from '@/types/stores';
dayjs.locale('th');
dayjs.extend(buddhistEra);

interface StoreDetailDialogProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (storeId: number) => void;
  onReject?: (storeId: number) => void;
  onBan?: (storeId: number) => void;
  onUnban?: (storeId: number) => void;
  hideAdminActions?: boolean;
}

const StoreDetailDialog: React.FC<StoreDetailDialogProps> = ({ store, isOpen, onClose, onApprove, onReject, onBan, onUnban, hideAdminActions = false }) => {
  const [previewImage, setPreviewImage] = useState<{
    isOpen: boolean;
    url: string;
    name: string;
  }>({
    isOpen: false,
    url: '',
    name: '',
  });

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin" && !hideAdminActions;

  if (!store) return null;

  // Handle contact info
  let contactInfo = {
    line: "",
    facebook: "",
    phone: "",
    address: "",
  };

  try {
    if (typeof store.contactInfo === 'string' && isValidJSON(store.contactInfo)) {
      contactInfo = JSON.parse(store.contactInfo);
    } else if (store.contactInfo && typeof store.contactInfo !== 'string') {
      contactInfo = {
        line: store.contactInfo.line || "",
        facebook: store.contactInfo.facebook || "",
        phone: store.contactInfo.phone || "",
        address: store.contactInfo.address || "",
      };
    }
  } catch (error) {
    console.error("Error parsing contact info:", error);
  }

  // Determine verification status and styling
  let verificationStatus = "";
  let statusColor = "";

  if (store.isVerified === true) {
    verificationStatus = "ผ่านการตรวจสอบ";
    statusColor = "text-green-600";
  } else if (store.isVerified === false) {
    verificationStatus = "ไม่ผ่านการตรวจสอบ";
    statusColor = "text-red-600";
  } else {
    verificationStatus = "รอการตรวจสอบ";
    statusColor = "text-yellow-600";
  }

  // Handle document view or download
  const handleDocumentAction = (doc: Partial<StoreDocument>) => {
    const documentUrl = getAuthenticatedImageUrl(doc.path || doc.url);

    if (!documentUrl) return;

    // If it's an ID card image, open in preview dialog
    if (doc.type === 'imageIdCard' || (doc.name && doc.name.includes('บัตรประชาชน'))) {
      setPreviewImage({
        isOpen: true,
        url: documentUrl,
        name: doc.name || 'บัตรประจำตัวประชาชน'
      });
    }
    // For certIncorp documents, trigger a download
    else if (doc.type === 'certIncorp' || (doc.name && doc.name.includes('จดทะเบียน'))) {
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = doc.name || 'เอกสารการจดทะเบียน.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // Default fallback - open in preview
    else {
      setPreviewImage({
        isOpen: true,
        url: documentUrl,
        name: doc.name || 'เอกสารร้านค้า'
      });
    }
  };

  // Close the preview dialog
  const handleClosePreview = () => {
    setPreviewImage({
      isOpen: false,
      url: '',
      name: '',
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-3xl p-0 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="flex justify-between items-center border-b p-4 sticky top-0 bg-white z-10">
            <DialogTitle className="text-xl font-medium">รายละเอียดร้านค้า</DialogTitle>
          </DialogHeader>
          <DialogDescription className="hidden"></DialogDescription>

          <div className="p-0">
            {/* Store Header Image */}
            <div className="relative w-full h-64 border-b border-gray-200">
              <Image
                fill
                src={getAuthenticatedImageUrl(store.imageStore) || defaultImage.src}
                alt={`รูปภาพร้าน ${store.storeName}`}
                className="object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.srcset = defaultImage.src;
                }}
              />
            </div>

            <div className="px-6 py-4">
              {/* Basic Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">ข้อมูลพื้นฐาน</h3>
                <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-md">
                  <div>
                    <div className="text-sm text-gray-500">ชื่อร้าน</div>
                    <div className="font-medium">{store.storeName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">อีเมล</div>
                    <div className="font-medium">{store.email || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">เลขบัญชี</div>
                    <div className="font-medium">{store.bankAccount || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">เลขประจำตัวผู้เสียภาษี</div>
                    <div className="font-medium">{store.taxId || "-"}</div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">ข้อมูลการติดต่อ</h3>
                <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-md">
                  <div>
                    <div className="text-sm text-gray-500">Line ID</div>
                    <div className="font-medium">@{contactInfo.line || "bkkelectronics"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Facebook</div>
                    <div className="font-medium">{contactInfo.facebook || "bkkelectronics"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">เบอร์โทรศัพท์</div>
                    <div className="font-medium">{contactInfo.phone || "082-345-6789"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">ที่อยู่</div>
                    <div className="font-medium">{contactInfo.address || "456 ถนนเพชรบุรี แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400"}</div>
                  </div>
                </div>
              </div>

              {/* Verification Documents */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">เอกสารยืนยันตัวตน</h3>
                <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-md">
                  {(store.documents && store.documents.length > 0) ? (
                    store.documents.map((doc, index) => (
                      <div key={index} className="flex items-center">
                        <div className="flex-1">
                          <div className="text-sm text-gray-500">{doc.type || "เอกสาร"}</div>
                          <div className="font-medium">{doc.name}</div>
                        </div>
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center cursor-pointer"
                          onClick={() => handleDocumentAction(doc as StoreDocument)}
                        >
                          {doc.type === 'certIncorp' || (doc.name && doc.name.includes('จดทะเบียน')) ? (
                            <>
                              <Download size={16} className="mr-1" />
                              <span>ดาวน์โหลด</span>
                            </>
                          ) : (
                            <>
                              <Eye size={16} className="mr-1" />
                              <span>ดูเอกสาร</span>
                            </>
                          )}
                        </button>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">เอกสารการจดทะเบียน</div>
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center cursor-pointer"
                          onClick={() => handleDocumentAction({
                            type: 'certIncorp',
                            name: 'หนังสือรับรองบริษัท',
                            path: store.certIncrop || ''
                          })}
                        >
                          <Download size={16} className="mr-1" />
                          <span>ดาวน์โหลด</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">บัตรประจำตัวประชาชน</div>
                        <button
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center cursor-pointer"
                          onClick={() => handleDocumentAction({
                            type: 'imageIdCard',
                            name: 'สำเนาบัตรประชาชน',
                            path: store.imageIdCard || ''
                          })}
                        >
                          <Eye size={16} className="mr-1" />
                          <span>ดูเอกสาร</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">สถานะ</h3>
                <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-md">
                  <div>
                    <div className="text-sm text-gray-500">สถานะการตรวจสอบ</div>
                    <div className={`font-medium ${statusColor}`}>{verificationStatus}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500">วันที่สมัคร</div>
                    <div className="font-medium">{dayjs(store.createdAt).format('DD MMMM BBBB')}</div>
                  </div>

                  {store.isVerified === true && store.verifiedAt && (
                    <div>
                      <div className="text-sm text-gray-500">วันที่ผ่านการตรวจสอบ</div>
                      <div className="font-medium">{dayjs(store.verifiedAt).format('DD MMMM BBBB')}</div>
                    </div>
                  )}

                  {store.isVerified === false && store.rejectionReason && (
                    <div>
                      <div className="text-sm text-gray-500">เหตุผลการไม่อนุมัติ</div>
                      <div className="font-medium text-red-600">{store.rejectionReason}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm text-gray-500">วันที่อัปเดตล่าสุด</div>
                    <div className="font-medium">{dayjs(store.updatedAt).format('DD MMMM BBBB')}</div>
                  </div>
                </div>
              </div>

              {/* Store Statistics
              {store.isVerified === true && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">ข้อมูลเชิงสถิติ</h3>
                  <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-md">
                    <div>
                      <div className="text-sm text-gray-500">ร้านค้าเปิดอยู่</div>
                      <div className="font-medium">2 วัน</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">ร้านค้าผ่านการตรวจสอบ</div>
                      <div className="font-medium">1 วัน</div>
                    </div>
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Footer Actions (based on user role) */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex justify-end gap-2">
            <Button
              variant="primary"
              onClick={onClose}
            >
              ปิด
            </Button>
            
            {/* Admin-only actions */}
            {isAdmin && (
              <>
                {store.isVerified === null && !store.isBanned && (
                  <>
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => onApprove && onApprove(store.id)}
                    >
                      อนุมัติ
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => onReject && onReject(store.id)}
                    >
                      ปฏิเสธ
                    </Button>
                  </>
                )}
                {store.isVerified === true && !store.isBanned && (
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => onBan && onBan(store.id)}
                  >
                    แบนร้านค้า
                  </Button>
                )}
                {store.isBanned && (
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => onUnban && onUnban(store.id)}
                  >
                    ยกเลิกแบน
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <DocumentPreviewDialog
        isOpen={previewImage.isOpen}
        onClose={handleClosePreview}
        imageUrl={previewImage.url}
        documentName={previewImage.name}
      />
    </>
  );
};

export default StoreDetailDialog; 