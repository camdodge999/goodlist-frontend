import { VerificationStatus, VerificationStatusType } from "@/types/verify";

export const getStatusDetails = (status: VerificationStatusType): VerificationStatus => {
  switch (status) {
    case 'not_started':
      return {
        status: 'not_started',
        message: 'ร้านค้าของคุณยังไม่ได้ยืนยันตัวตน กรุณากรอกข้อมูลและอัพโหลดเอกสารเพื่อเริ่มกระบวนการยืนยันตัวตน'
      };
    case 'pending':
      return {
        status: 'pending',
        message: 'เอกสารของคุณอยู่ระหว่างการตรวจสอบ กรุณารอการติดต่อกลับจากทีมงาน'
      };
    case 'verified':
      return {
        status: 'verified',
        message: 'ร้านค้าของคุณได้รับการยืนยันตัวตนเรียบร้อยแล้ว คุณสามารถใช้งานระบบได้อย่างเต็มรูปแบบ'
      };
    case 'banned':
      return {
        status: 'banned',
        message: 'ร้านค้าของคุณถูกระงับการใช้งาน กรุณาติดต่อเจ้าหน้าที่เพื่อขอข้อมูลเพิ่มเติม'
      };
    default:
      return {
        status: 'not_started',
        message: 'คุณยังไม่ได้ยืนยันตัวตน กรุณากรอกข้อมูลและอัพโหลดเอกสารเพื่อเริ่มกระบวนการยืนยันตัวตน'
      };
  }
};