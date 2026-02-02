"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getConsultantById } from "@/lib/mock-data/consultants";
import { ConsultantProfile } from "@/components/consultants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConsultantProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const { locale } = useLanguage();
  const consultant = getConsultantById(id);

  if (!consultant) {
    notFound();
  }

  const labels = {
    back: locale === "da" ? "Tilbage til konsulenter" : "Back to consultants",
    editCV: locale === "da" ? "Rediger CV" : "Edit CV",
    exportCV: locale === "da" ? "Eksporter CV" : "Export CV",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/consultants"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {labels.back}
        </Link>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {labels.editCV}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {labels.exportCV}
          </button>
        </div>
      </div>

      {/* Profile */}
      <ConsultantProfile consultant={consultant} />
    </div>
  );
}
