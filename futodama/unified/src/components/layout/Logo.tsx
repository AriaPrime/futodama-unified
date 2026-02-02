"use client";

import Link from "next/link";
import Image from "next/image";

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      {/* Light mode logo - hidden in dark mode */}
      <Image
        src="/creadis-logo.gif"
        alt="CREADIS"
        width={120}
        height={24}
        priority
        className="h-6 w-auto dark:hidden"
      />
      {/* Dark mode logo - hidden in light mode */}
      <Image
        src="/creadis-logo-white.gif"
        alt="CREADIS"
        width={120}
        height={24}
        priority
        className="h-6 w-auto hidden dark:block"
      />
    </Link>
  );
}
