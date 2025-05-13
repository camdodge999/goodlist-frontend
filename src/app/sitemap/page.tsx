import { Metadata } from 'next';
import Link from "next/link";
import ContentWidth from "@/components/layout/ContentWidth";
import { Footer } from "@/components/landing";
import { sitemapSections } from '@/consts/sitemap';

export const metadata: Metadata = {
  title: 'แผนผังเว็บไซต์ | Goodlistseller',
  description: 'แผนผังเว็บไซต์ Goodlistseller - แพลตฟอร์มร้านค้าออนไลน์ที่น่าเชื่อถือในประเทศไทย',
};

export default function SitemapPage() {

  return (
    <>
      <div className="bg-gray-50 py-16 min-h-[calc(100vh-440px)]">
        <ContentWidth>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">แผนผังเว็บไซต์</h1>
            
            <div className="bg-white shadow-md rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sitemapSections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    <h2 className="text-xl font-semibold text-blue-600 pb-2 border-b border-gray-200">
                      {section.title}
                    </h2>
                    <ul className="space-y-2">
                      {section.links.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <Link 
                            href={link.url}
                            className="text-gray-700 hover:text-blue-600 hover:underline transition-colors"
                          >
                            {link.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ContentWidth>
      </div>
      <Footer />
    </>
  );
} 