"use client";

import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold">
      {/* DIS/CREADIS Logo Grid */}
      <div className="flex flex-col gap-[0.5px]">
        <div className="flex gap-[0.5px]">
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">D</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">I</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">S</div>
        </div>
        <div className="flex gap-[0.5px]">
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">C</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">R</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">E</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">A</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">D</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">I</div>
          <div className="w-3 h-3 bg-primary text-primary-foreground flex items-center justify-center text-[5px] font-bold">S</div>
        </div>
      </div>
      <span className="hidden sm:inline text-sm font-medium">Futodama</span>
    </Link>
  );
}
