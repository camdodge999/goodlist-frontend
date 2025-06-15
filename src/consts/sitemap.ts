import { SitemapSection } from "@/types/sitemap";

export const sitemapSections: SitemapSection[] = [
    {
        title: 'หน้าหลัก',
        links: [
            { name: 'หน้าแรก', url: '/' },
            { name: 'ร้านค้าทั้งหมด', url: '/stores' },
            // { name: 'ค้นหาร้านค้า', url: '/search' },
        ]
    },
    {
        title: 'บัญชีผู้ใช้',
        links: [
            { name: 'เข้าสู่ระบบ', url: '/login' },
            { name: 'สมัครสมาชิก', url: '/signup' },
            // { name: 'แดชบอร์ด', url: '/dashboard' },
            { name: 'โปรไฟล์', url: '/profile' },
        ]
    },
    {
        title: 'ร้านค้า',
        links: [
            { name: 'ยืนยันร้านค้า', url: '/verify' },
            { name: 'รายงานร้านค้า', url: '/report' },
        ]
    },
    {
        title: 'ข้อมูลอื่นๆ',
        links: [
            // { name: 'เงื่อนไขการใช้งาน', url: '/terms' },
            { name: 'นโยบายความเป็นส่วนตัว', url: '/privacy' },
        ]
    },
    {
        title: 'ช่วยเหลือ',
        links: [
            { name: 'คำถามที่พบบ่อย', url: '/faq' },
        ]
    }
];