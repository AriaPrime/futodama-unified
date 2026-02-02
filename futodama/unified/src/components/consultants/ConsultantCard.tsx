"use client";

import Link from "next/link";
import Image from "next/image";
import type { Consultant, AvailabilityStatus } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConsultantCardProps {
  consultant: Consultant;
}

const availabilityColors: Record<AvailabilityStatus, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  partially_available: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  unavailable: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const availabilityLabels: Record<AvailabilityStatus, { en: string; da: string }> = {
  available: { en: "Available", da: "Tilgængelig" },
  partially_available: { en: "Partial", da: "Delvis" },
  unavailable: { en: "Unavailable", da: "Optaget" },
};

function CVHealthBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? "text-green-600 dark:text-green-400" :
    score >= 70 ? "text-yellow-600 dark:text-yellow-400" :
    "text-red-600 dark:text-red-400";
  
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${color}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {score}%
    </div>
  );
}

export function ConsultantCard({ consultant }: ConsultantCardProps) {
  const { locale: language } = useLanguage();
  const { id, name, title, photo, availability, cv, cvHealthScore, location, employmentType } = consultant;

  return (
    <Link href={`/consultants/${id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
            <Image
              src={photo}
              alt={name}
              fill
              className="object-cover"
              sizes="56px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-500">{location}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                {employmentType === "freelance" ? "Freelance" : language === "da" ? "Ansat" : "Employee"}
              </span>
            </div>
          </div>
          <CVHealthBadge score={cvHealthScore} />
        </div>

        {/* Availability Badge */}
        <div className="mt-4 flex items-center justify-between">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${availabilityColors[availability.status]}`}>
            {availabilityLabels[availability.status][language]}
            {availability.date && ` - ${new Date(availability.date).toLocaleDateString(language === "da" ? "da-DK" : "en-GB", { month: "short", day: "numeric" })}`}
          </span>
        </div>

        {/* Skills Preview */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {cv.skills.slice(0, 4).map((skill) => (
            <span
              key={skill.id}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {skill.name}
            </span>
          ))}
          {cv.skills.length > 4 && (
            <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
              +{cv.skills.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
