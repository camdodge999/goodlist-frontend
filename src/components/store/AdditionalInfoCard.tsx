import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faCreditCard, faShield } from '@fortawesome/free-solid-svg-icons';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StoreAudit } from "@/types/stores";
import dayjs from "dayjs";
import 'dayjs/locale/th';

interface AdditionalInfoCardProps {
  createdAt: string;
  bankAccount: string;
  verificationAudit?: StoreAudit;
}

export default function AdditionalInfoCard({ 
  createdAt, 
  bankAccount, 
  verificationAudit 
}: AdditionalInfoCardProps) {
  return (
    <Card className="p-5 border border-gray-100 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        ข้อมูลเพิ่มเติม
      </h2>
      <dl className="space-y-4">
        <div>
          <dt className="text-md font-medium text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faCalendar} className="mr-2 text-gray-400 text-md" />
            <span>วันที่เข้าร่วม</span>
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            {dayjs(createdAt).locale('th').format('D MMMM YYYY')}
          </dd>
        </div>

        <div>
          <dt className="text-md font-medium text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-400 text-md" />
            <span>บัญชีธนาคาร</span>
          </dt>
          <dd className="mt-1 text-sm text-gray-900">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {bankAccount}
              </Badge>
            </div>
            {/* {!isLoggedIn && (
              <div className="mt-2 flex items-center gap-2 text-yellow-600 bg-yellow-50 p-3 rounded-md">
                <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5" />
                <p className="text-sm">
                  กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดบัญชีธนาคาร
                </p>
              </div>
            )} */}
          </dd>
        </div>

        {verificationAudit && (
          <div>
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <FontAwesomeIcon icon={faShield} className="w-4 h-4 mr-2 text-gray-400" />
              วันที่ยืนยันตัวตน
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {dayjs(verificationAudit.createdAt).locale('th').format('D MMMM YYYY')}
            </dd>
          </div>
        )}
      </dl>
    </Card>
  );
} 