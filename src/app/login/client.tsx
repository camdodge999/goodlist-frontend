"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";

export default function LoginClientPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        // If the user is already logged in, redirect to profile
        if (status === "authenticated") {
            router.push("/profile");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-cover bg-center z-0"></div>
            <div className="absolute inset-0 bg-blue-900 opacity-40 z-10"></div>
            <LoginForm />
        </div>
    );
} 