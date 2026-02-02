"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

export function Logo() {
  const { theme } = useTheme();
  
  // Use white logo for dark mode, regular logo for light mode
  const logoSrc = theme === "dark" 
    ? "/creadis-logo-white.gif" 
    : "/creadis-logo.gif";

  return (
    <Link href="/" className="flex items-center">
      <Image
        src={logoSrc}
        alt="CREADIS"
        width={120}
        height={24}
        priority
        className="h-6 w-auto"
      />
    </Link>
  );
}
