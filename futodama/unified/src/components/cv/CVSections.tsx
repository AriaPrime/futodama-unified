'use client';

import { CVSection, Observation } from '@/types/cv';
import { RoleCard } from './RoleCard';

interface CVSectionsProps {
  sections: CVSection[];
  observations: Observation[];
  highlightedSectionId?: string;
  onContentUpdate?: (sectionId: string, newContent: string) => void;
  language?: 'en' | 'da';
}

const sectionTypeLabels: Record<string, { en: string; da: string }> = {
  job: { en: 'Experience', da: 'Erfaring' },
  education: { en: 'Education', da: 'Uddannelse' },
  skill: { en: 'Skills', da: 'Kompetencer' },
  project: { en: 'Projects', da: 'Projekter' },
  summary: { en: 'Summary', da: 'Resumé' },
  other: { en: 'Other', da: 'Andet' },
};

const sectionTypeOrder = ['summary', 'job', 'education', 'skill', 'project', 'other'];

export function CVSections({ 
  sections, 
  observations,
  highlightedSectionId, 
  onContentUpdate,
  language = 'en' 
}: CVSectionsProps) {
  // Group sections by type
  const groupedSections = sections.reduce((acc, section) => {
    const type = section.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(section);
    return acc;
  }, {} as Record<string, CVSection[]>);

  // Sort groups by predefined order
  const sortedGroups = sectionTypeOrder
    .filter(type => groupedSections[type]?.length > 0)
    .map(type => ({
      type,
      label: sectionTypeLabels[type]?.[language] || type,
      sections: groupedSections[type],
    }));

  // Create a map of section ID to pending observation
  const sectionObservationMap = observations.reduce((acc, obs) => {
    if (obs.status === 'pending' && !acc[obs.sectionId]) {
      acc[obs.sectionId] = obs;
    }
    return acc;
  }, {} as Record<string, Observation>);

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {language === 'da' 
          ? 'Ingen sektioner fundet i CV\'et'
          : 'No sections found in the CV'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map(({ type, label, sections: groupSections }) => (
        <div key={type}>
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            {label}
            <span className="text-sm font-normal text-muted-foreground">
              ({groupSections.length})
            </span>
          </h2>
          <div className="space-y-3">
            {groupSections.map((section) => (
              <RoleCard
                key={section.id}
                section={section}
                observation={sectionObservationMap[section.id]}
                isHighlighted={section.id === highlightedSectionId}
                onContentUpdate={onContentUpdate}
                language={language}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
