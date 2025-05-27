import { FAQ } from "@/types/faq";

export const faqs: FAQ[] = [
  // Account Management
  {
    id: "account-creation",
    question: {
      en: "How do I create an account?",
      th: "ฉันจะสร้างบัญชีได้อย่างไร?"
    },
    answer: {
      en: "To create an account, click on the \"Sign Up\" button in the top right corner of the homepage. Fill in your details including name, email address, and password. Verify your email address by clicking the link sent to your inbox, and your account will be ready to use.",
      th: "การสร้างบัญชีทำได้ง่ายๆ เพียงคลิกที่ปุ่ม \"สมัครสมาชิก\" ที่มุมขวาบนของหน้าแรก กรอกข้อมูลส่วนตัวของคุณ เช่น ชื่อ อีเมล และรหัสผ่าน จากนั้นยืนยันอีเมลของคุณโดยคลิกลิงก์ที่เราส่งไปยังกล่องจดหมายของคุณ เพียงเท่านี้บัญชีของคุณก็พร้อมใช้งานแล้ว!"
    },
    category: "account"
  },
  {
    id: "account-verification",
    question: {
      en: "How does account verification work?",
      th: "การยืนยันตัวตนทำงานอย่างไร?"
    },
    answer: {
      en: "Account verification helps ensure the security and authenticity of our users. After registration, we'll send a verification link to your email. Click the link to verify your account. For business accounts, additional documentation may be required to verify your business identity.",
      th: "การยืนยันตัวตนช่วยให้มั่นใจในความปลอดภัยและความน่าเชื่อถือของผู้ใช้งาน หลังจากลงทะเบียน เราจะส่งลิงก์ยืนยันไปที่อีเมลของคุณ เพียงคลิกที่ลิงก์เพื่อยืนยันบัญชีของคุณ สำหรับบัญชีธุรกิจ อาจต้องใช้เอกสารเพิ่มเติมเพื่อยืนยันตัวตนทางธุรกิจของคุณ ทั้งนี้เพื่อสร้างความเชื่อมั่นให้กับผู้ใช้งานทุกคนบนแพลตฟอร์มของเรา"
    },
    category: "account"
  },
  {
    id: "account-deletion",
    question: {
      en: "How can I delete my account?",
      th: "ฉันจะลบบัญชีของฉันได้อย่างไร?"
    },
    answer: {
      en: "To delete your account, go to your account settings and select the \"Delete Account\" option. You'll be asked to confirm your decision. Once confirmed, your account and personal data will be permanently deleted from our system within 30 days, in accordance with our data retention policy.",
      th: "หากคุณต้องการลบบัญชี เข้าไปที่การตั้งค่าบัญชีของคุณและเลือกตัวเลือก \"ลบบัญชี\" ระบบจะขอให้คุณยืนยันการตัดสินใจอีกครั้ง เมื่อยืนยันแล้ว บัญชีและข้อมูลส่วนตัวของคุณจะถูกลบออกจากระบบของเราอย่างถาวรภายใน 30 วัน ตามนโยบายการเก็บรักษาข้อมูลของเรา เราพยายามทำให้การใช้งานเว็บไซต์ของเราสะดวกและเป็นส่วนตัวที่สุดสำหรับคุณ"
    },
    category: "account"
  },
  
  // Policies & Terms
  {
    id: "privacy-policy",
    question: {
      en: "What is your privacy policy?",
      th: "นโยบายความเป็นส่วนตัวของคุณคืออะไร?"
    },
    answer: {
      en: "Our privacy policy outlines how we collect, use, and protect your personal information. We only collect information necessary to provide our services and improve user experience. We never sell your personal data to third parties. You can review our complete privacy policy in the footer of our website.",
      th: "นโยบายความเป็นส่วนตัวของเราอธิบายวิธีการเก็บรวบรวม ใช้งาน และปกป้องข้อมูลส่วนบุคคลของคุณ เราเก็บเฉพาะข้อมูลที่จำเป็นในการให้บริการและปรับปรุงประสบการณ์ผู้ใช้เท่านั้น เราไม่เคยขายข้อมูลส่วนตัวของคุณให้กับบุคคลที่สาม คุณสามารถอ่านนโยบายความเป็นส่วนตัวฉบับเต็มได้ที่ส่วนท้ายของเว็บไซต์ของเรา เราพยายามทำให้การใช้งานเว็บไซต์ของเราสะดวกและเป็นส่วนตัวที่สุดสำหรับคุณ"
    },
    category: "policy"
  },
  {
    id: "terms-of-service",
    question: {
      en: "What are your terms of service?",
      th: "เงื่อนไขการให้บริการของคุณคืออะไร?"
    },
    answer: {
      en: "Our terms of service outline the rules and guidelines for using our platform. By using our service, you agree to abide by these terms, which include respecting other users, not engaging in fraudulent activities, and using the platform for its intended purpose. The complete terms of service can be found in the footer of our website.",
      th: "เงื่อนไขการให้บริการของเราระบุกฎและแนวทางในการใช้แพลตฟอร์มของเรา เมื่อคุณใช้บริการของเรา แสดงว่าคุณยอมรับที่จะปฏิบัติตามเงื่อนไขเหล่านี้ ซึ่งรวมถึงการเคารพผู้ใช้รายอื่น ไม่มีส่วนร่วมในกิจกรรมที่เป็นการฉ้อโกง และใช้แพลตฟอร์มตามวัตถุประสงค์ที่กำหนดไว้ คุณสามารถอ่านเงื่อนไขการให้บริการฉบับเต็มได้ที่ส่วนท้ายของเว็บไซต์ของเรา เราสร้างกฎเหล่านี้เพื่อให้ทุกคนมีประสบการณ์ที่ดีบนแพลตฟอร์มของเรา"
    },
    category: "policy"
  },
  {
    id: "content-policy",
    question: {
      en: "What content is prohibited on the platform?",
      th: "เนื้อหาแบบใดที่ห้ามใช้บนแพลตฟอร์ม?"
    },
    answer: {
      en: "We prohibit content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable. This includes but is not limited to content that promotes discrimination, violence, or illegal activities. We reserve the right to remove any content that violates these guidelines and may suspend accounts that repeatedly post prohibited content.",
      th: "เราห้ามเนื้อหาที่ผิดกฎหมาย เป็นอันตราย คุกคาม ล่วงละเมิด หมิ่นประมาท หยาบคาย ลามกอนาจาร หรือเนื้อหาที่ไม่เหมาะสมอื่นๆ ซึ่งรวมถึงแต่ไม่จำกัดเพียงเนื้อหาที่ส่งเสริมการเลือกปฏิบัติ ความรุนแรง หรือกิจกรรมที่ผิดกฎหมาย เราขอสงวนสิทธิ์ในการลบเนื้อหาใดๆ ที่ละเมิดแนวทางเหล่านี้และอาจระงับบัญชีที่โพสต์เนื้อหาต้องห้ามซ้ำๆ เราต้องการให้แพลตฟอร์มของเราเป็นพื้นที่ปลอดภัยและเป็นมิตรสำหรับทุกคน"
    },
    category: "policy"
  },
  
  // Data Security
  {
    id: "data-security",
    question: {
      en: "How do you ensure data security?",
      th: "คุณรับประกันความปลอดภัยของข้อมูลอย่างไร?"
    },
    answer: {
      en: "We implement industry-standard security measures to protect your data, including encryption, secure server infrastructure, and regular security audits. All personal information is encrypted both in transit and at rest. We also employ strict access controls to ensure only authorized personnel can access user data when necessary.",
      th: "เราใช้มาตรการรักษาความปลอดภัยตามมาตรฐานอุตสาหกรรมเพื่อปกป้องข้อมูลของคุณ ซึ่งรวมถึงการเข้ารหัส โครงสร้างเซิร์ฟเวอร์ที่ปลอดภัย และการตรวจสอบความปลอดภัยเป็นประจำ ข้อมูลส่วนบุคคลทั้งหมดถูกเข้ารหัสทั้งในระหว่างการส่งและเมื่อจัดเก็บ นอกจากนี้ เรายังใช้การควบคุมการเข้าถึงที่เข้มงวดเพื่อให้มั่นใจว่าเฉพาะเจ้าหน้าที่ที่ได้รับอนุญาตเท่านั้นที่สามารถเข้าถึงข้อมูลผู้ใช้ได้เมื่อจำเป็น ความปลอดภัยของข้อมูลคุณคือสิ่งที่เราให้ความสำคัญสูงสุด"
    },
    category: "security"
  },
  {
    id: "data-retention",
    question: {
      en: "What is your data retention policy?",
      th: "นโยบายการเก็บรักษาข้อมูลของคุณคืออะไร?"
    },
    answer: {
      en: "We retain your personal information only as long as necessary to provide you with our services or as required by law. When you delete your account, your personal data is permanently removed from our systems within 30 days. However, some anonymized data may be retained for analytical purposes.",
      th: "เราเก็บรักษาข้อมูลส่วนบุคคลของคุณเฉพาะเท่าที่จำเป็นในการให้บริการหรือตามที่กฎหมายกำหนดเท่านั้น เมื่อคุณลบบัญชีของคุณ ข้อมูลส่วนบุคคลของคุณจะถูกลบออกจากระบบของเราอย่างถาวรภายใน 30 วัน อย่างไรก็ตาม ข้อมูลที่ไม่ระบุตัวตนบางส่วนอาจถูกเก็บไว้เพื่อวัตถุประสงค์ในการวิเคราะห์ เรามุ่งมั่นที่จะโปร่งใสเกี่ยวกับวิธีการจัดการข้อมูลของคุณตลอดเวลา"
    },
    category: "security"
  },
  {
    id: "third-party-sharing",
    question: {
      en: "Do you share my data with third parties?",
      th: "คุณแชร์ข้อมูลของฉันกับบุคคลที่สามหรือไม่?"
    },
    answer: {
      en: "We only share your data with third parties when necessary to provide our services, such as payment processors or cloud service providers. We have strict data protection agreements with all our service providers. We never sell your personal information to advertisers or other third parties for marketing purposes.",
      th: "เราแชร์ข้อมูลของคุณกับบุคคลที่สามเฉพาะเมื่อจำเป็นในการให้บริการเท่านั้น เช่น ผู้ประมวลผลการชำระเงินหรือผู้ให้บริการคลาวด์ เรามีข้อตกลงการคุ้มครองข้อมูลที่เข้มงวดกับผู้ให้บริการทุกราย เราไม่เคยขายข้อมูลส่วนบุคคลของคุณให้กับผู้โฆษณาหรือบุคคลที่สามอื่นๆ เพื่อวัตถุประสงค์ทางการตลาด คุณสามารถวางใจได้ว่าข้อมูลของคุณจะไม่ถูกนำไปใช้ในทางที่ผิด"
    },
    category: "security"
  },
  
  // Cookies & Tracking
  {
    id: "cookies-usage",
    question: {
      en: "How do you use cookies?",
      th: "คุณใช้คุกกี้อย่างไร?"
    },
    answer: {
      en: "We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. Essential cookies are necessary for the website to function properly, while optional cookies help us improve our services. You can manage your cookie preferences through your browser settings or our cookie consent banner.",
      th: "เราใช้คุกกี้เพื่อเพิ่มประสบการณ์การท่องเว็บของคุณ วิเคราะห์การเข้าชมเว็บไซต์ และปรับแต่งเนื้อหาให้เหมาะกับคุณ คุกกี้ที่จำเป็นมีความสำคัญต่อการทำงานของเว็บไซต์อย่างถูกต้อง ในขณะที่คุกกี้ตัวเลือกช่วยให้เราปรับปรุงบริการของเรา คุณสามารถจัดการการตั้งค่าคุกกี้ผ่านการตั้งค่าเบราว์เซอร์ของคุณหรือแบนเนอร์ยินยอมคุกกี้ของเรา เราพยายามทำให้การใช้งานเว็บไซต์ของเราสะดวกและเป็นส่วนตัวที่สุดสำหรับคุณ"
    },
    category: "cookies"
  },
  
  // General
  {
    id: "what-is-goodlist",
    question: {
      en: "What is GoodList?",
      th: "GoodList คืออะไร?"
    },
    answer: {
      en: "GoodList is a platform that allows you to find and verify trusted online stores. We help consumers connect with legitimate businesses and help store owners build trust with their customers.",
      th: "GoodList เป็นแพลตฟอร์มที่ช่วยให้คุณค้นหาและตรวจสอบร้านค้าออนไลน์ที่น่าเชื่อถือ เราช่วยให้ผู้บริโภคเชื่อมต่อกับธุรกิจที่ถูกต้องตามกฎหมาย และช่วยให้เจ้าของร้านสร้างความไว้วางใจกับลูกค้าของพวกเขา เราเป็นเหมือนสะพานเชื่อมระหว่างผู้ซื้อและผู้ขายที่ดีที่สุด ทำให้การช้อปปิ้งออนไลน์ของคุณปลอดภัยและมั่นใจยิ่งขึ้น"
    },
    category: "general"
  },
  {
    id: "create-store-request",
    question: {
      en: "How do I create a store request?",
      th: "ฉันจะสร้างคำขอร้านค้าได้อย่างไร?"
    },
    answer: {
      en: "You can create a store request by clicking the 'Create New Request' button on the store requests page. Fill in your store details, upload required verification documents, and submit your request for review.",
      th: "คุณสามารถสร้างคำขอร้านค้าได้โดยคลิกที่ปุ่ม 'สร้างคำขอใหม่' บนหน้าคำขอร้านค้า กรอกรายละเอียดร้านค้าของคุณ อัปโหลดเอกสารยืนยันตัวตนที่จำเป็น และส่งคำขอของคุณเพื่อตรวจสอบ เราพยายามทำให้กระบวนการนี้ง่ายและรวดเร็วที่สุด เพื่อให้คุณสามารถเริ่มต้นธุรกิจออนไลน์ได้อย่างราบรื่น"
    },
    category: "general"
  },
  {
    id: "manage-store-requests",
    question: {
      en: "How do I manage my store requests?",
      th: "ฉันจะจัดการคำขอร้านค้าของฉันได้อย่างไร?"
    },
    answer: {
      en: "You can manage your store requests by logging into your account and navigating to the 'My Requests' section. Here you can view the status of your requests, update information, and respond to any verification queries.",
      th: "คุณสามารถจัดการคำขอร้านค้าของคุณได้โดยเข้าสู่ระบบบัญชีของคุณและไปที่ส่วน 'คำขอของฉัน' ที่นี่คุณสามารถดูสถานะของคำขอ อัปเดตข้อมูล และตอบคำถามเกี่ยวกับการยืนยันตัวตนต่างๆ เราออกแบบระบบให้ใช้งานง่าย เพื่อให้คุณติดตามและจัดการคำขอได้อย่างสะดวก ไม่ว่าคุณจะอยู่ที่ไหนหรือใช้อุปกรณ์ใดก็ตาม"
    },
    category: "general"
  }
];

