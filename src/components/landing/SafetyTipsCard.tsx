"use client"

import { SafetyTip } from "@/types/safetyTip";
import Image from "next/image";
import defaultLogo from "@images/logo-placeholder.png";

// Safety tip card component
export default function SafetyTipCard({ tip }: { tip: SafetyTip }) {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="relative h-48 w-full">
                <Image
                    src={tip.image}
                    alt={tip.alt}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.srcset = defaultLogo.src;
                    }}
                />
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{tip.title}</h3>
                <p className="text-gray-600">
                    {tip.description}
                </p>
            </div>
        </div>
    );
}