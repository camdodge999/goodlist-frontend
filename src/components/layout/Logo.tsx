"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "@images/logo.png";

export default function Logo() {
  return (
    <div className="flex lg:flex-1">
      <Link href="/" className="-m-1.5 p-1.5 pb-0">
        <Image
          src={logo}
          alt="Goodlistseller logo"
          width={72}
          height={72}
          className="h-10 sm:h-16 w-auto object-contain"
          priority
          quality={100}
          unoptimized
        />
      </Link>
    </div>
  );
} 