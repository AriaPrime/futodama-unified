"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center font-semibold">
      {/* CREADIS Logo - matching mockup style */}
      <span className="text-xl font-bold tracking-[0.2em] text-primary">
        CREADIS
      </span>
    </Link>
  );
}
