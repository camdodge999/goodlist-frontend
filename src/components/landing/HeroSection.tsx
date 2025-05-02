import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStore, 
  faSearch, 
} from '@fortawesome/free-solid-svg-icons';
import ContentWidth from "@/components/layout/ContentWidth";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import heroBg from "@images/hero-bg.jpg";

interface HeroSectionProps {
  session: Session | null;
}

export function HeroSection({ session }: HeroSectionProps) {
  return (
    <ContentWidth fullWidth>
      <div className="relative isolate min-h-screen overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <Image
            src={heroBg}
            alt="Background"
            fill
            className="object-cover animate-subtle-zoom"
            priority
          />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-blue-700/90 to-blue-800/95 animate-gradient" />

          {/* Animated geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/40 rounded-full blur-2xl animate-blob" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/40 rounded-full blur-2xl animate-blob animation-delay-2000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/40 rounded-full blur-2xl animate-blob animation-delay-4000" />
          </div>

          {/* Animated grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] animate-grid-fade" />
        </div>

        <div className="relative h-screen flex items-center">
          <div className="w-full text-center px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="absolute inset-0 blur-3xl bg-blue-500/20 animate-pulse" />
              <h1 className="relative text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-in-up">
                รวมร้านค้าออนไลน์ที่คุณไว้ใจได้
              </h1>
              <h2 className="relative mt-4 text-2xl font-semibold tracking-tight text-gray-100 sm:text-3xl lg:text-4xl animate-fade-in-up animation-delay-100">
                Trusted Online Stores in One Place
              </h2>
            </div>
            <p className="mt-6 text-lg sm:text-xl leading-8 text-gray-100 animate-fade-in-up animation-delay-200 max-w-3xl mx-auto">
              Goodlistseller -
              แพลตฟอร์มที่ช่วยให้คุณค้นหาร้านค้าออนไลน์ที่เชื่อถือได้ในประเทศไทย
              <br />
              Join our community of verified sellers and safe shoppers
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up animation-delay-400">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Link href={session ? "/verify" : "/signup"}>
                  <FontAwesomeIcon icon={faStore} className="w-5 h-5 mr-2" />
                  สมัครเป็นร้านค้า
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                <Link href="/stores">
                  <FontAwesomeIcon icon={faSearch} className="w-5 h-5 mr-2" />
                  ดูร้านค้าที่เชื่อถือได้
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ContentWidth>
  );
} 