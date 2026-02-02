"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { AvailabilityStatus, EmploymentType } from "@/types";

interface ConsultantFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  availability: AvailabilityStatus | "all";
  onAvailabilityChange: (value: AvailabilityStatus | "all") => void;
  employmentType: EmploymentType | "all";
  onEmploymentTypeChange: (value: EmploymentType | "all") => void;
  skillFilter: string;
  onSkillFilterChange: (value: string) => void;
  availableSkills: string[];
}

export function ConsultantFilters({
  search,
  onSearchChange,
  availability,
  onAvailabilityChange,
  employmentType,
  onEmploymentTypeChange,
  skillFilter,
  onSkillFilterChange,
  availableSkills,
}: ConsultantFiltersProps) {
  const { locale } = useLanguage();

  // Simple labels based on locale
  const labels = locale === "da" ? {
    search: "Søg",
    searchPlaceholder: "Søg navn, titel, skills...",
    availability: "Tilgængelighed",
    allStatuses: "Alle statusser",
    available: "Tilgængelig",
    partiallyAvailable: "Delvis tilgængelig",
    unavailable: "Ikke tilgængelig",
    employmentType: "Ansættelsestype",
    allTypes: "Alle typer",
    employee: "Fastansat",
    freelance: "Freelance",
    skills: "Kompetencer",
    allSkills: "Alle kompetencer",
  } : {
    search: "Search",
    searchPlaceholder: "Search name, title, skills...",
    availability: "Availability",
    allStatuses: "All statuses",
    available: "Available",
    partiallyAvailable: "Partially available",
    unavailable: "Unavailable",
    employmentType: "Employment Type",
    allTypes: "All types",
    employee: "Employee",
    freelance: "Freelance",
    skills: "Skills",
    allSkills: "All skills",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {labels.search}
          </label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={labels.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {labels.availability}
          </label>
          <select
            value={availability}
            onChange={(e) => onAvailabilityChange(e.target.value as AvailabilityStatus | "all")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">{labels.allStatuses}</option>
            <option value="available">{labels.available}</option>
            <option value="partially_available">{labels.partiallyAvailable}</option>
            <option value="unavailable">{labels.unavailable}</option>
          </select>
        </div>

        {/* Employment Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {labels.employmentType}
          </label>
          <select
            value={employmentType}
            onChange={(e) => onEmploymentTypeChange(e.target.value as EmploymentType | "all")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">{labels.allTypes}</option>
            <option value="employee">{labels.employee}</option>
            <option value="freelance">{labels.freelance}</option>
          </select>
        </div>

        {/* Skills Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {labels.skills}
          </label>
          <select
            value={skillFilter}
            onChange={(e) => onSkillFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">{labels.allSkills}</option>
            {availableSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
