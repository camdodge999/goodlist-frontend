import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faHourglassHalf, 
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { VerificationStatus, VerificationStatusType } from '@/types/verify';

interface VerificationStatusBoxProps {
  status: VerificationStatusType;
}

const getStatusDetails = (status: VerificationStatusType): VerificationStatus => {
  switch (status) {
    case 'not_started':
      return {
        status: 'not_started',
        message: 'คุณยังไม่ได้ยืนยันตัวตน กรุณากรอกข้อมูลและอัพโหลดเอกสารเพื่อเริ่มกระบวนการยืนยันตัวตน'
      };
    case 'pending':
      return {
        status: 'pending',
        message: 'เอกสารของคุณอยู่ระหว่างการตรวจสอบ กรุณารอการติดต่อกลับจากทีมงาน'
      };
    case 'verified':
      return {
        status: 'verified',
        message: 'คุณได้รับการยืนยันตัวตนเรียบร้อยแล้ว คุณสามารถใช้งานระบบได้อย่างเต็มรูปแบบ'
      };
    case 'banned':
      return {
        status: 'banned',
        message: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อเจ้าหน้าที่เพื่อขอข้อมูลเพิ่มเติม'
      };
    default:
      return {
        status: 'not_started',
        message: 'คุณยังไม่ได้ยืนยันตัวตน กรุณากรอกข้อมูลและอัพโหลดเอกสารเพื่อเริ่มกระบวนการยืนยันตัวตน'
      };
  }
};

const VerificationStatusBox: React.FC<VerificationStatusBoxProps> = ({ status }) => {
  const statusDetails = getStatusDetails(status);
  
  let bgColor = 'bg-gray-50';
  let textColor = 'text-gray-700';
  let borderColor = 'border-gray-200';
  let icon = faHourglassHalf;
  let iconColor = 'text-gray-400';
  
  switch (status) {
    case 'verified':
      bgColor = 'bg-green-50';
      textColor = 'text-green-700';
      borderColor = 'border-green-200';
      icon = faCheckCircle;
      iconColor = 'text-green-500';
      break;
    case 'pending':
      bgColor = 'bg-yellow-50';
      textColor = 'text-yellow-700';
      borderColor = 'border-yellow-200';
      icon = faHourglassHalf;
      iconColor = 'text-yellow-500';
      break;
    case 'banned':
      bgColor = 'bg-red-50';
      textColor = 'text-red-700';
      borderColor = 'border-red-200';
      icon = faExclamationTriangle;
      iconColor = 'text-red-500';
      break;
    default:
      break;
  }
  
  return (
    <div className={`p-4 ${bgColor} ${textColor} rounded-md border ${borderColor} mb-8`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <FontAwesomeIcon icon={icon} className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium">
            สถานะการยืนยันตัวตน: {status === 'verified' 
              ? 'ยืนยันแล้ว' 
              : status === 'pending' 
                ? 'รอการตรวจสอบ' 
                : status === 'banned' 
                  ? 'ถูกระงับ' 
                  : 'ยังไม่ได้ยืนยัน'}
          </h3>
          <div className="mt-2 text-sm">
            <p>{statusDetails.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusBox; 