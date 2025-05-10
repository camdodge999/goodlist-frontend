"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginClientPage() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleRedirect = useCallback(() => {
        // If the user is already authenticated, redirect to the callback URL or profile
        if (status === "authenticated") {
            const callbackUrl = searchParams.get('callbackUrl') || '/profile';
            router.push(callbackUrl);
        }
    }, [status, router, searchParams]);

    useEffect(() => {
        handleRedirect();
    }, [handleRedirect]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-blue-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-82px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute inset-0 bg-cover bg-center z-0"></div>
            <div className="absolute inset-0 bg-blue-900 opacity-40 z-10"></div>
            <LoginForm />
        </div>
    );
} 