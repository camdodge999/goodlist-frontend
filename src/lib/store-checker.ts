import { faCheckCircle, faExclamationTriangle, faInfoCircle, IconDefinition } from "@fortawesome/free-solid-svg-icons";

export const getTrustLevelColor = (level: string): `border-${string}` => {
    switch (level) {
        case "high": return "border-green-500";
        case "medium": return "border-yellow-500";
        default: return "border-red-500";
    }
};

export const getTrustLevelIcon = (level: string): { icon: IconDefinition, color: string } => {
    switch (level) {
        case "high": return { icon: faCheckCircle, color: "text-green-500" };
        case "medium": return { icon: faInfoCircle, color: "text-yellow-500" };
        default: return { icon: faExclamationTriangle, color: "text-red-500" };
    }
};

export const getTrustLevelText = (level: string): string => {
    switch (level) {
        case "high": return "น่าเชื่อถือ";
        case "medium": return "ควรระวัง";
        default: return "ไม่น่าเชื่อถือ";
    }
};

export const getTrustLevelDescription = (level: string): string => {
    switch (level) {
        case "high":
            return "ร้านค้านี้มีความน่าเชื่อถือสูง สามารถซื้อสินค้าได้อย่างปลอดภัย";
        case "medium":
            return "ควรตรวจสอบข้อมูลเพิ่มเติมก่อนตัดสินใจซื้อสินค้า";
        default:
            return "ไม่แนะนำให้ซื้อสินค้าจากร้านค้านี้ เนื่องจากมีความเสี่ยงสูง";
    }
};