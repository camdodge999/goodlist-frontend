import React from 'react';
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebook, 
  faLine, 
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope, 
  faMapMarkerAlt, 
  faPhone 
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import Logo from "@/components/layout/Logo";
export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <ContentWidth>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 mr-2">
                <Logo />
              </div>
              <h3 className="text-xl font-bold">Goodlistseller</h3>
            </div>
            <p className="text-gray-400 text-sm">
              แพลตฟอร์มที่ช่วยให้คุณค้นหาร้านค้าออนไลน์ที่เชื่อถือได้ในประเทศไทย
            </p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faFacebook} className="h-5 w-5" />
              </Link>
              <Link href="https://line.me" className="text-gray-400 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faLine} className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors">
                <FontAwesomeIcon icon={faInstagram} className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ลิงก์ด่วน</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/stores" className="text-gray-400 hover:text-white transition-colors">
                  ร้านค้าทั้งหมด
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-gray-400 hover:text-white transition-colors">
                  ยืนยันร้านค้า
                </Link>
              </li>
              <li>
                <Link href="/report" className="text-gray-400 hover:text-white transition-colors">
                  รายงานร้านค้า
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  คำถามที่พบบ่อย
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ข้อมูลทางกฎหมาย</h4>
            <ul className="space-y-2">
              {/* <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  เงื่อนไขการใช้งาน
                </Link>
              </li> */}
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </li>
              <li>
                <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                  แผนผังเว็บไซต์
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">ติดต่อเรา</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="h-5 w-5 text-blue-400 mt-0.5 mr-3" />
                <span className="text-gray-400">
                  123 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110
                </span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faPhone} className="h-5 w-5 text-blue-400 mr-3" />
                <span className="text-gray-400">02-123-4567</span>
              </li>
              <li className="flex items-center">
                <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5 text-blue-400 mr-3" />
                <a href="mailto:contact@goodlistseller.com" className="text-gray-400 hover:text-white transition-colors">
                  contact@goodlistseller.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {currentYear} Goodlistseller. สงวนลิขสิทธิ์ทั้งหมด.</p>
        </div>
      </ContentWidth>
    </footer>
  );
} 