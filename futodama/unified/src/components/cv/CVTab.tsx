'use client';

import { useState, useCallback } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CVUploader } from './CVUploader';
import { CVSections } from './CVSections';
import { CVHealthWidget } from './CVHealthWidget';
import { EmptyState } from './EmptyState';
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

  const handleReset = () => {
    setCV(null);
    setHighlightedSectionId(undefined);
  };

  // Empty state - show uploader with intro
  if (!cv) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-8">
        <EmptyState language={language} />
        <CVUploader 
          onUploadComplete={handleUploadComplete} 
          language={language} 
        />
      </div>
    );
  }

  // Calculate stats
  const totalSections = cv.sections.length;
  const totalObservations = cv.observations.length;
  const pendingObservations = cv.observations.filter(o => o.status === 'pending').length;
  const acceptedObservations = cv.observations.filter(o => o.status === 'accepted').length;

  // Has CV - show analysis
  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{cv.fileName}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>{totalSections} {language === 'da' ? 'sektioner' : 'sections'}</span>
              <span>•</span>
              <span>{totalObservations} {language === 'da' ? 'observationer' : 'observations'}</span>
              {acceptedObservations > 0 && (
                <>
                  <span>•</span>
                  <span className="text-green-600">
                    {acceptedObservations} {language === 'da' ? 'forbedret' : 'improved'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {language === 'da' ? 'Ny analyse' : 'New analysis'}
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex gap-6">
        {/* CV sections */}
        <div className="flex-1 min-w-0">
          <CVSections
            sections={cv.sections}
            observations={cv.observations}
            highlightedSectionId={highlightedSectionId}
            onContentUpdate={handleContentUpdate}
            language={language}
          />
        </div>

        {/* Health widget sidebar */}
        <div className="w-80 shrink-0 hidden lg:block">
          <div className="sticky top-24">
            <CVHealthWidget
              observations={cv.observations}
              strengths={cv.strengths}
              onSelectObservation={handleSelectObservation}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Mobile health widget - shows at bottom on small screens */}
      <div className="lg:hidden">
        <CVHealthWidget
          observations={cv.observations}
          strengths={cv.strengths}
          onSelectObservation={handleSelectObservation}
          language={language}
        />
      </div>
    </div>
  );
}
