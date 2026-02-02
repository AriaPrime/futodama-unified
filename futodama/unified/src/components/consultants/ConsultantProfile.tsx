"use client";

import Image from "next/image";
import type { Consultant, AvailabilityStatus, SkillLevel, LanguageLevel } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { ConsultantHealthPanel } from "./ConsultantHealthPanel";

interface ConsultantProfileProps {
  consultant: Consultant;
}

const availabilityColors: Record<AvailabilityStatus, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  partially_available: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  unavailable: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const availabilityLabels: Record<AvailabilityStatus, { en: string; da: string }> = {
  available: { en: "Available", da: "Tilgængelig" },
  partially_available: { en: "Partially Available", da: "Delvis tilgængelig" },
  unavailable: { en: "Unavailable", da: "Optaget" },
};

const skillLevelLabels: Record<SkillLevel, { en: string; da: string }> = {
  experienced: { en: "Experienced", da: "Erfaren" },
  very_experienced: { en: "Very Experienced", da: "Meget erfaren" },
  expert: { en: "Expert", da: "Ekspert" },
};

const languageLevelLabels: Record<LanguageLevel, { en: string; da: string }> = {
  basic: { en: "Basic", da: "Grundlæggende" },
  conversational: { en: "Conversational", da: "Samtale" },
  fluent: { en: "Fluent", da: "Flydende" },
  native: { en: "Native", da: "Modersmål" },
};

function CVHealthScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const color =
    score >= 85 ? "text-green-500" :
    score >= 70 ? "text-yellow-500" :
    "text-red-500";

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="36"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx="48"
          cy="48"
          r="36"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={color}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xl font-bold ${color}`}>{score}%</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function ConsultantProfile({ consultant }: ConsultantProfileProps) {
  const { locale: language } = useLanguage();
  const { name, title, photo, email, phone, location, employmentType, availability, hourlyRate, cv, cvHealthScore, lastCVUpdate } = consultant;

  const labels = {
    contactInfo: language === "da" ? "Kontaktoplysninger" : "Contact Information",
    professionalProfile: language === "da" ? "Professionel profil" : "Professional Profile",
    personalProfile: language === "da" ? "Personlig profil" : "Personal Profile",
    experience: language === "da" ? "Erfaring" : "Experience",
    education: language === "da" ? "Uddannelse" : "Education",
    courses: language === "da" ? "Kurser & Certificeringer" : "Courses & Certifications",
    skills: language === "da" ? "Kompetencer" : "Skills",
    languages: language === "da" ? "Sprog" : "Languages",
    cvHealth: language === "da" ? "CV Sundhed" : "CV Health",
    lastUpdated: language === "da" ? "Sidst opdateret" : "Last updated",
    hourlyRate: language === "da" ? "Timepris" : "Hourly Rate",
    present: language === "da" ? "Nu" : "Present",
    certified: language === "da" ? "Certificeret" : "Certified",
  };

  // Group skills by category
  const skillsByCategory = cv.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof cv.skills>);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
              <Image
                src={photo}
                alt={name}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">{title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${availabilityColors[availability.status]}`}>
                  {availabilityLabels[availability.status][language]}
                  {availability.date && ` - ${new Date(availability.date).toLocaleDateString(language === "da" ? "da-DK" : "en-GB")}`}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                  {employmentType === "freelance" ? "Freelance" : language === "da" ? "Ansat" : "Employee"}
                </span>
              </div>
            </div>
          </div>

          {/* CV Health Score */}
          <div className="md:ml-auto flex flex-col items-center">
            <CVHealthScore score={cvHealthScore} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{labels.cvHealth}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {labels.lastUpdated}: {new Date(lastCVUpdate).toLocaleDateString(language === "da" ? "da-DK" : "en-GB")}
            </p>
          </div>
        </div>

        {/* Contact Info Row */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">{email}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">{phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400">{labels.hourlyRate}: {hourlyRate} DKK</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Profile */}
          {cv.professionalProfile && (
            <Section title={labels.professionalProfile}>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{cv.professionalProfile}</p>
            </Section>
          )}

          {/* Personal Profile */}
          {cv.personalProfile && (
            <Section title={labels.personalProfile}>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{cv.personalProfile}</p>
            </Section>
          )}

          {/* Experience */}
          {cv.experience.length > 0 && (
            <Section title={labels.experience}>
              <div className="space-y-6">
                {cv.experience.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l-2 border-green-500 dark:border-green-600">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-green-500 dark:bg-green-600" />
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-1 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{exp.role}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company} — {exp.project}</p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">
                        {exp.startDate} — {exp.endDate || labels.present}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{exp.description}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {cv.education.length > 0 && (
            <Section title={labels.education}>
              <div className="space-y-4">
                {cv.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{edu.degree} — {edu.field}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution}</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-500">{edu.startYear} — {edu.endYear}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Courses & Certifications */}
          {cv.courses.length > 0 && (
            <Section title={labels.courses}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cv.courses.map((course) => (
                  <div key={course.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    {course.certificate && (
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{course.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{course.institution} • {course.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sidebar (1 col) */}
        <div className="space-y-6">
          {/* Skills */}
          <Section title={labels.skills}>
            <div className="space-y-4">
              {Object.entries(skillsByCategory).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm"
                        title={skillLevelLabels[skill.level][language]}
                      >
                        {skill.name}
                        {skill.level === "expert" && (
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Languages */}
          {cv.languages.length > 0 && (
            <Section title={labels.languages}>
              <div className="space-y-3">
                {cv.languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between">
                    <span className="text-gray-900 dark:text-white">{lang.language}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {languageLevelLabels[lang.level][language]}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* CV Health Panel */}
          <Section title={labels.cvHealth}>
            <ConsultantHealthPanel consultant={consultant} />
          </Section>
        </div>
      </div>
    </div>
  );
}
