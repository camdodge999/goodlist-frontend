import { faCheckCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";


// Example store data
export const exampleStores = [
    {
      id: 1,
      name: "Fashion Boutique",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&auto=format&fit=crop",
      verified: true,
      trustLevel: "high"
    },
    {
      id: 2,
      name: "Tech Gadgets Shop",
      image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600&auto=format&fit=crop",
      verified: false,
      trustLevel: "medium"
    },
    {
      id: 3,
      name: "Discount Store",
      image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=600&auto=format&fit=crop",
      verified: false,
      trustLevel: "low"
    }
  ];
  
  // How it works steps
  export const howItWorksSteps = [
    {
      id: 1,
      title: "ใส่ชื่อร้านค้า",
      description: "พิมพ์หรือวางชื่อร้านค้าที่คุณต้องการตรวจสอบ"
    },
    {
      id: 2,
      title: "ระบบตรวจสอบ",
      description: "ระบบจะค้นหาข้อมูลร้านค้าจากฐานข้อมูล"
    },
    {
      id: 3,
      title: "ผลการตรวจสอบ",
      description: "ดูผลการตรวจสอบความน่าเชื่อถือของร้านค้า"
    }
  ];
  
  // Safety levels
  export const safetyLevels = [
    {
      id: 1,
      title: "น่าเชื่อถือ",
      description: "ร้านค้าที่ผ่านการตรวจสอบและมีความน่าเชื่อถือสูง สามารถซื้อสินค้าได้อย่างปลอดภัย",
      icon: faCheckCircle,
      color: "green",
      borderColor: "border-green-500",
      textColor: "text-green-500"
    },
    {
      id: 3,
      title: "ไม่น่าเชื่อถือ",
      description: "ร้านค้าที่มีความเสี่ยงสูง อาจเป็นร้านค้าปลอมหรือมีประวัติการหลอกลวง ไม่ควรซื้อสินค้า",
      icon: faExclamationTriangle,
      color: "red",
      borderColor: "border-red-500",
      textColor: "text-red-500"
    }
  ];