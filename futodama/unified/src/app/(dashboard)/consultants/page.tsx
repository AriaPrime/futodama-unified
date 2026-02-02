"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { consultants } from "@/lib/mock-data/consultants";
import { ConsultantCard, ConsultantFilters, CVUploadDialog } from "@/components/consultants";
import type { AvailabilityStatus, EmploymentType } from "@/types";

export default function ConsultantsPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState<AvailabilityStatus | "all">("all");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "all">("all");
  const [skillFilter, setSkillFilter] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Get all unique skills for the filter dropdown
  const allSkills = useMemo(() => {
    const skillSet = new Set<string>();
    consultants.forEach(c => c.cv.skills.forEach(s => skillSet.add(s.name)));
    return Array.from(skillSet).sort();
  }, []);

  // Filter consultants
  const filteredConsultants = useMemo(() => {
    return consultants.filter(c => {
      // Search filter
      if (search) {
        const lowerSearch = search.toLowerCase();
        const matchesSearch = 
          c.name.toLowerCase().includes(lowerSearch) ||
          c.title.toLowerCase().includes(lowerSearch) ||
          c.cv.skills.some(s => s.name.toLowerCase().includes(lowerSearch));
        if (!matchesSearch) return false;
      }

      // Availability filter
      if (availability !== "all" && c.availability.status !== availability) {
        return false;
      }

      // Employment type filter
      if (employmentType !== "all" && c.employmentType !== employmentType) {
        return false;
      }

      // Skill filter
      if (skillFilter && !c.cv.skills.some(s => s.name === skillFilter)) {
        return false;
      }

      return true;
    });
  }, [search, availability, employmentType, skillFilter]);

  const hasFilters = search || availability !== "all" || employmentType !== "all" || skillFilter;

  const resetFilters = () => {
    setSearch("");
    setAvailability("all");
    setEmploymentType("all");
    setSkillFilter("");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t.consultants.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredConsultants.length} {t.consultants.found}
          </p>
        </div>
        <button
          onClick={() => setShowUploadDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t.consultants.uploadCV}
        </button>
      </div>

      {/* Filters */}
      <ConsultantFilters
        search={search}
        onSearchChange={setSearch}
        availability={availability}
        onAvailabilityChange={setAvailability}
        employmentType={employmentType}
        onEmploymentTypeChange={setEmploymentType}
        skillFilter={skillFilter}
        onSkillFilterChange={setSkillFilter}
        availableSkills={allSkills}
      />

      {/* Results */}
      {filteredConsultants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConsultants.map(consultant => (
            <ConsultantCard key={consultant.id} consultant={consultant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {t.consultants.noResults}
          </p>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              {t.consultants.resetFilters}
            </button>
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <CVUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
      />
    </div>
  );
}
