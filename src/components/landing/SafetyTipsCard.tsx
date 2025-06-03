"use client"

import { SafetyTip } from "@/types/safetyTip";
import Image from "next/image";
import defaultLogo from "@images/logo-placeholder.png";

// Safety tip card component
export default function SafetyTipCard({ tip }: { tip: SafetyTip }) {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const target = e.currentTarget as HTMLImageElement;
        target.srcset = defaultLogo.src;
    };


    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
            <div className="relative h-64 md:h-48 lg:h-32 w-full flex-shrink-0">
                <Image
                    src={tip.image}
                    alt={tip.alt}
                    fill
                    className="object-cover sm:object-contain"
                    onError={handleImageError}
                    style={{
                        color: undefined,
                    }}
                />
            </div>
            <div className="p-6 flex-grow flex flex-col z-20 bg-white">
                <h3 className="text-xl font-semibold mb-3">{tip.title}</h3>
                <p className="text-gray-600 flex-grow">
                    {tip.description}
                </p>
            </div>
        </div>
    );
}