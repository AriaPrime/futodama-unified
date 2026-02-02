"use client";

import { useMemo } from "react";
import { CVHealthWidget } from "@/components/cv/CVHealthWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Consultant } from "@/types";
import type { Observation } from "@/types/cv";

interface ConsultantHealthPanelProps {
  consultant: Consultant;
}

// Generate observations based on consultant's actual CV data
function generateObservations(consultant: Consultant, locale: 'en' | 'da'): Observation[] {
  const observations: Observation[] = [];
  const { cv, cvHealthScore, lastCVUpdate } = consultant;
  
  // Check CV staleness
  const lastUpdate = new Date(lastCVUpdate);
  const monthsAgo = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  if (monthsAgo > 2) {
    observations.push({
      id: 'stale-cv',
      sectionId: 'general',
      type: 'temporal',
      confidence: 0.9,
      signal: 'stale_cv',
      message: locale === 'da' 
        ? `CV'et er sidst opdateret for ${monthsAgo} måneder siden. Overvej at tilføje nyere erfaring.`
        : `CV was last updated ${monthsAgo} months ago. Consider adding recent experience.`,
      actionType: 'add_info',
      status: 'pending',
    });
  }

  // Check experience descriptions
  const shortDescriptions = cv.experience.filter(exp => exp.description.length < 100);
  if (shortDescriptions.length > 0) {
    observations.push({
      id: 'short-descriptions',
      sectionId: cv.experience[0]?.id || 'experience',
      type: 'density',
      confidence: 0.85,
      signal: 'sparse_density',
      message: locale === 'da'
        ? `${shortDescriptions.length} rolle(r) har korte beskrivelser. Tilføj detaljer om resultater og ansvar.`
        : `${shortDescriptions.length} role(s) have brief descriptions. Add details about achievements and responsibilities.`,
      actionType: 'guided_edit',
      status: 'pending',
    });
  }

  // Check for certifications
  const hasCerts = cv.courses.some(c => c.certificate);
  const certAge = cv.courses
    .filter(c => c.certificate)
    .map(c => new Date().getFullYear() - c.year);
  const oldCerts = certAge.filter(age => age > 3).length;
  
  if (hasCerts && oldCerts > 0) {
    observations.push({
      id: 'old-certs',
      sectionId: 'courses',
      type: 'temporal',
      confidence: 0.75,
      signal: 'outdated_cert',
      message: locale === 'da'
        ? `${oldCerts} certificering(er) er over 3 år gammel. Overvej at forny eller tilføje nyere.`
        : `${oldCerts} certification(s) are over 3 years old. Consider renewing or adding newer ones.`,
      actionType: 'add_info',
      status: 'pending',
    });
  }

  // Check skills coverage
  const skillCategories = new Set(cv.skills.map(s => s.category));
  if (skillCategories.size < 3) {
    observations.push({
      id: 'narrow-skills',
      sectionId: 'skills',
      type: 'structural',
      confidence: 0.7,
      signal: 'narrow_coverage',
      message: locale === 'da'
        ? 'Kompetenceprofilen er smal. Overvej at tilføje flere kategorier (f.eks. soft skills, værktøjer).'
        : 'Skills profile is narrow. Consider adding more categories (e.g., soft skills, tools).',
      actionType: 'add_info',
      status: 'pending',
    });
  }

  // Check personal profile
  if (!cv.personalProfile || cv.personalProfile.length < 50) {
    observations.push({
      id: 'missing-personal',
      sectionId: 'personalProfile',
      type: 'structural',
      confidence: 0.8,
      signal: 'missing_section',
      message: locale === 'da'
        ? 'Personlig profil mangler eller er for kort. Dette hjælper med at differentiere dig.'
        : 'Personal profile is missing or too short. This helps differentiate you from others.',
      actionType: 'add_info',
      status: 'pending',
    });
  }

  // Check for metrics in experience
  const hasMetrics = cv.experience.some(exp => 
    /\d+%|\d+\s*(million|mio|kr|dkk|users|brugere)/i.test(exp.description)
  );
  if (!hasMetrics && cv.experience.length > 0) {
    observations.push({
      id: 'no-metrics',
      sectionId: cv.experience[0]?.id || 'experience',
      type: 'density',
      confidence: 0.85,
      signal: 'missing_metrics',
      message: locale === 'da'
        ? 'Erfaringsbeskrivelser mangler målbare resultater. Tilføj tal og KPI\'er.'
        : 'Experience descriptions lack measurable outcomes. Add numbers and KPIs.',
      actionType: 'guided_edit',
      status: 'pending',
    });
  }

  return observations;
}

// Generate strengths based on consultant's CV
function generateStrengths(consultant: Consultant, locale: 'en' | 'da'): string[] {
  const strengths: string[] = [];
  const { cv, cvHealthScore } = consultant;

  // Expert-level skills
  const expertSkills = cv.skills.filter(s => s.level === 'expert');
  if (expertSkills.length >= 2) {
    const skillNames = expertSkills.slice(0, 3).map(s => s.name).join(', ');
    strengths.push(locale === 'da'
      ? `Stærk ekspertise inden for ${skillNames}`
      : `Strong expertise in ${skillNames}`
    );
  }

  // Good experience tenure
  const totalYears = cv.experience.reduce((acc, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }, 0);
  
  if (totalYears >= 5) {
    strengths.push(locale === 'da'
      ? `${Math.round(totalYears)}+ års relevant erhvervserfaring`
      : `${Math.round(totalYears)}+ years of relevant professional experience`
    );
  }

  // Certifications
  const certs = cv.courses.filter(c => c.certificate);
  if (certs.length >= 2) {
    strengths.push(locale === 'da'
      ? `${certs.length} aktive certificeringer dokumenterer kompetencer`
      : `${certs.length} active certifications document competencies`
    );
  }

  // Languages
  const fluentLangs = cv.languages.filter(l => l.level === 'fluent' || l.level === 'native');
  if (fluentLangs.length >= 2) {
    strengths.push(locale === 'da'
      ? 'Flydende i flere sprog muliggør international kommunikation'
      : 'Fluent in multiple languages enables international collaboration'
    );
  }

  // Professional profile quality
  if (cv.professionalProfile && cv.professionalProfile.length > 150) {
    strengths.push(locale === 'da'
      ? 'Velformuleret professionel profil'
      : 'Well-articulated professional profile'
    );
  }

  return strengths.slice(0, 3); // Max 3 strengths
}

export function ConsultantHealthPanel({ consultant }: ConsultantHealthPanelProps) {
  const { locale } = useLanguage();
  
  const observations = useMemo(
    () => generateObservations(consultant, locale),
    [consultant, locale]
  );
  
  const strengths = useMemo(
    () => generateStrengths(consultant, locale),
    [consultant, locale]
  );

  return (
    <CVHealthWidget
      observations={observations}
      strengths={strengths}
      language={locale}
    />
  );
}
