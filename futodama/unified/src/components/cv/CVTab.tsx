'use client';

import { useState, useCallback } from 'react';
import { CVUploader } from './CVUploader';
import { CVSections } from './CVSections';
import { CVHealthWidget } from './CVHealthWidget';
import { CV, AnalyzeResponse } from '@/types/cv';

interface CVTabProps {
  language?: 'en' | 'da';
}

export function CVTab({ language = 'en' }: CVTabProps) {
  const [cv, setCV] = useState<CV | null>(null);
  const [highlightedSectionId, setHighlightedSectionId] = useState<string | undefined>();

  const handleUploadComplete = useCallback((data: unknown) => {
    const response = data as AnalyzeResponse;
    setCV(response.cv);
  }, []);

  const handleSelectObservation = useCallback((sectionId: string) => {
    setHighlightedSectionId(sectionId);
    
    // Scroll to the section
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedSectionId(undefined);
    }, 3000);
  }, []);

  const handleContentUpdate = useCallback((sectionId: string, newContent: string) => {
    if (!cv) return;

    // Update the section content
    const updatedSections = cv.sections.map(section => 
      section.id === sectionId 
        ? { ...section, content: newContent, wordCount: newContent.split(/\s+/).length }
        : section
    );

    // Mark the observation as accepted
    const updatedObservations = cv.observations.map(obs =>
      obs.sectionId === sectionId && obs.status === 'pending'
        ? { ...obs, status: 'accepted' as const }
        : obs
    );

    setCV({
      ...cv,
      sections: updatedSections,
      observations: updatedObservations,
    });
  }, [cv]);

  // Empty state - show uploader
  if (!cv) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <CVUploader 
          onUploadComplete={handleUploadComplete} 
          language={language} 
        />
      </div>
    );
  }

  // Has CV - show analysis
  return (
    <div className="flex gap-6">
      {/* Main content - CV sections */}
      <div className="flex-1 min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{cv.fileName}</h2>
            <p className="text-sm text-muted-foreground">
              {cv.sections.length} {language === 'da' ? 'sektioner' : 'sections'} • {' '}
              {new Date(cv.uploadedAt).toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US')}
            </p>
          </div>
          <button
            onClick={() => setCV(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {language === 'da' ? 'Upload ny' : 'Upload new'}
          </button>
        </div>

        <CVSections
          sections={cv.sections}
          observations={cv.observations}
          highlightedSectionId={highlightedSectionId}
          onContentUpdate={handleContentUpdate}
          language={language}
        />
      </div>

      {/* Sidebar - Health widget */}
      <div className="w-80 shrink-0">
        <div className="sticky top-4">
          <CVHealthWidget
            observations={cv.observations}
            strengths={cv.strengths}
            onSelectObservation={handleSelectObservation}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
