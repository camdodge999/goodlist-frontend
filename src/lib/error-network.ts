export const NETWORK_ERRORS = {
    NETWORK_ERROR: "NETWORK_ERROR",
    CONNECTION_REFUSED: "CONNECTION_REFUSED",
    TIMEOUT_ERROR: "TIMEOUT_ERROR",
    UNKNOWN_ERROR: "UNKNOWN_ERROR",
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    MISSING_CREDENTIALS: "MISSING_CREDENTIALS",
    SERVER_ERROR_500: "SERVER_ERROR_500",
    SERVER_ERROR_404: "SERVER_ERROR_404",
    SERVER_ERROR_503: "SERVER_ERROR_503",
    SERVER_ERROR_401: "SERVER_ERROR_401",
    INVALID_RESPONSE_FORMAT: "INVALID_RESPONSE_FORMAT",
    INVALID_TOKEN_FORMAT: "INVALID_TOKEN_FORMAT",
}

export const getErrorMessage = (error: string) => {
     // Handle specific error codes from auth.ts
     let errorMessage = "เกิดข้อผิดพลาดขณะเข้าสู่ระบบ";
        
     switch (error) {
       case NETWORK_ERRORS.INVALID_CREDENTIALS:  
         errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
         break;
       case NETWORK_ERRORS.MISSING_CREDENTIALS:
         errorMessage = "กรุณากรอกข้อมูลให้ครบถ้วน";
         break;
       case NETWORK_ERRORS.SERVER_ERROR_500:
         errorMessage = "เซิร์ฟเวอร์มีปัญหา กรุณาลองอีกครั้งในภายหลัง";
         break;
       case NETWORK_ERRORS.SERVER_ERROR_404: 
         errorMessage = "ไม่พบเซิร์ฟเวอร์ กรุณาตรวจสอบการเชื่อมต่อ";
         break;
       case NETWORK_ERRORS.SERVER_ERROR_503:
         errorMessage = "เซิร์ฟเวอร์ไม่พร้อมใช้งาน กรุณาลองอีกครั้งในภายหลัง";
         break;
      case NETWORK_ERRORS.SERVER_ERROR_401:
         errorMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง";
         break;
       case NETWORK_ERRORS.INVALID_RESPONSE_FORMAT:
         errorMessage = "ข้อมูลตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง";
         break;
       case NETWORK_ERRORS.INVALID_TOKEN_FORMAT:
         errorMessage = "รูปแบบ Token ไม่ถูกต้อง";
         break;
       case NETWORK_ERRORS.UNKNOWN_ERROR:
         errorMessage = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
         break;
       case NETWORK_ERRORS.NETWORK_ERROR:
         errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต และลองใหม่อีกครั้ง";
         break;
       case NETWORK_ERRORS.CONNECTION_REFUSED:
         errorMessage = "เซิร์ฟเวอร์ปฏิเสธการเชื่อมต่อ กรุณาลองอีกครั้งในภายหลัง";
         break;
       case NETWORK_ERRORS.TIMEOUT_ERROR:
         errorMessage = "การเชื่อมต่อหมดเวลา กรุณาลองอีกครั้ง";
         break;
       default:
         // Handle HTTP error codes
         if (error.startsWith("SERVER_ERROR_")) {
           const statusCode = error.replace("SERVER_ERROR_", "");
           errorMessage = `เซิร์ฟเวอร์ตอบกลับด้วยรหัสข้อผิดพลาด ${statusCode}`;
         } else {
           errorMessage = `ข้อผิดพลาด: ${error}`;
         }
         break;
    }
    return errorMessage;
}   