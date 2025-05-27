"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faHome, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function NotFound() {
    return (
        <div className="relative isolate min-h-[calc(100vh-80px)] overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10">
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

            <div className="relative h-[calc(100vh-80px)] flex items-center">
                <div className="w-full text-center px-4 sm:px-6 lg:px-8 text-white">
                    <div className="relative">
                        <div className="absolute inset-0 blur-3xl bg-blue-500/20 animate-pulse" />
                        {/* 404 Text */}
                        <h1 className="relative text-9xl font-bold flex items-start justify-center animate-fade-in-up">
                            <span className="text-white mr-4">4</span>
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white" />
                            <span className="text-white">4</span>
                        </h1>

                        {/* Main Message */}
                        <div className="space-y-4">
                            <h2 className="relative text-3xl md:text-4xl font-bold text-center animate-fade-in-up animation-delay-100">
                                ไม่พบหน้าที่คุณกำลังค้นหา
                            </h2>
                            <p className="relative text-xl md:text-2xl text-center animate-fade-in-up animation-delay-200">
                                Page Not Found
                            </p>
                            <p className="relative text-lg max-w-md mx-auto opacity-90 text-center animate-fade-in-up animation-delay-300">
                                หน้าที่คุณกำลังค้นหาอาจถูกลบ เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up animation-delay-400">
                        <Link href="/">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-gray-100"
                            >
                                <FontAwesomeIcon icon={faHome} className="w-5 h-5 mr-2" />
                                กลับหน้าหลัก
                            </Button>
                        </Link>
                        <Link href="/search">
                            <Button
                                variant="outline"
                                size="lg"
                                className="bg-transparent text-white border-white hover:bg-white/10"
                            >
                                <FontAwesomeIcon icon={faSearch} className="w-5 h-5 mr-2" />
                                ค้นหาร้านค้า
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}