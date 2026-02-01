'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Briefcase, GraduationCap, Code, FileText, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CVSection, Observation } from '@/types/cv';
import { GuidedEditor } from './GuidedEditor';

interface RoleCardProps {
  section: CVSection;
  observation?: Observation;
  isHighlighted?: boolean;
  onContentUpdate?: (sectionId: string, newContent: string) => void;
  language?: 'en' | 'da';
}

const sectionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  job: Briefcase,
  education: GraduationCap,
  skill: Code,
  project: FileText,
  summary: FileText,
  other: FileText,
};

function formatDuration(months: number | undefined, language: 'en' | 'da'): string {
  if (!months) return '';
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (language === 'da') {
    if (years === 0) return `${remainingMonths} mdr`;
    if (remainingMonths === 0) return `${years} år`;
    return `${years} år ${remainingMonths} mdr`;
  } else {
    if (years === 0) return `${remainingMonths} mo`;
    if (remainingMonths === 0) return `${years} yr${years > 1 ? 's' : ''}`;
    return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mo`;
  }
}

function formatDateRange(startDate: string | undefined, endDate: string | undefined, language: 'en' | 'da'): string {
  if (!startDate) return '';
  
  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString(language === 'da' ? 'da-DK' : 'en-US', {
      year: 'numeric',
      month: 'short',
    });
  };
  
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : (language === 'da' ? 'Nu' : 'Present');
  
  return `${start} – ${end}`;
}

export function RoleCard({ 
  section, 
  observation,
  isHighlighted = false, 
  onContentUpdate,
  language = 'en' 
}: RoleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(section.content);
  
  const Icon = sectionIcons[section.type] || FileText;
  const dateRange = formatDateRange(section.startDate, section.endDate, language);
  const duration = formatDuration(section.duration, language);
  
  // Truncate content for preview
  const previewLength = 200;
  const shouldTruncate = currentContent.length > previewLength;
  const displayContent = isExpanded || !shouldTruncate 
    ? currentContent 
    : currentContent.substring(0, previewLength) + '...';

  const handleApply = (newContent: string) => {
    setCurrentContent(newContent);
    setIsEditing(false);
    onContentUpdate?.(section.id, newContent);
  };

  return (
    <div id={`section-${section.id}`}>
      <Card 
        className={cn(
          'p-4 transition-all',
          isHighlighted && 'ring-2 ring-primary ring-offset-2',
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn(
            'rounded-lg p-2 shrink-0',
            section.type === 'job' && 'bg-primary/10 text-primary',
            section.type === 'education' && 'bg-accent/20 text-accent-foreground',
            section.type === 'skill' && 'bg-secondary text-secondary-foreground',
            section.type === 'project' && 'bg-muted text-muted-foreground',
          )}>
            <Icon className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                {section.organization && (
                  <p className="text-sm text-muted-foreground">{section.organization}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {duration && (
                  <Badge variant="secondary" className="text-xs">
                    {duration}
                  </Badge>
                )}
                {observation && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-2"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    {language === 'da' ? 'Forbedre' : 'Improve'}
                  </Button>
                )}
                {section.parseConfidence === 'low' && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    {language === 'da' ? 'Lav sikkerhed' : 'Low confidence'}
                  </Badge>
                )}
              </div>
            </div>
            
            {dateRange && (
              <p className="text-xs text-muted-foreground mt-1">{dateRange}</p>
            )}
            
            <div className="mt-3">
              <p className="text-sm text-foreground whitespace-pre-wrap">{displayContent}</p>
              
              {shouldTruncate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-auto py-1 px-2 text-xs"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      {language === 'da' ? 'Vis mindre' : 'Show less'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      {language === 'da' ? 'Vis mere' : 'Show more'}
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>{section.wordCount} {language === 'da' ? 'ord' : 'words'}</span>
              {section.densityScore !== undefined && (
                <span>
                  {language === 'da' ? 'Densitet' : 'Density'}: {section.densityScore.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Guided Editor */}
      {isEditing && observation && (
        <div className="mt-2">
          <GuidedEditor
            section={{ ...section, content: currentContent }}
            observation={observation}
            onApply={handleApply}
            onCancel={() => setIsEditing(false)}
            language={language}
          />
        </div>
      )}
    </div>
  );
}
