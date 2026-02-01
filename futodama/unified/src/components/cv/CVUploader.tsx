'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LoadingState, AnalysisError } from './LoadingState';

type AnalysisStage = 'idle' | 'uploading' | 'extracting' | 'parsing' | 'analyzing' | 'phrasing' | 'complete' | 'error';

interface CVUploaderProps {
  onUploadComplete: (data: unknown) => void;
  language?: 'en' | 'da';
}

export function CVUploader({ onUploadComplete, language = 'en' }: CVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<AnalysisStage>('idle');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    // Validate file type
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError(language === 'da' 
        ? 'Kun PDF og Word-dokumenter understøttes'
        : 'Only PDF and Word documents are supported');
      setStage('error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(language === 'da'
        ? 'Filen er for stor (max 10MB)'
        : 'File is too large (max 10MB)');
      setStage('error');
      return;
    }

    setError(null);
    setFileName(file.name);
    setStage('uploading');

    // Simulate stage progression for better UX
    const stageTimings = [
      { stage: 'extracting' as const, delay: 500 },
      { stage: 'parsing' as const, delay: 2000 },
      { stage: 'analyzing' as const, delay: 4000 },
      { stage: 'phrasing' as const, delay: 6000 },
    ];

    // Start stage progression
    stageTimings.forEach(({ stage, delay }) => {
      setTimeout(() => {
        setStage(current => {
          // Only advance if we're still in a loading state
          if (current !== 'complete' && current !== 'error' && current !== 'idle') {
            return stage;
          }
          return current;
        });
      }, delay);
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        headers: {
          'X-Language': language,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Upload failed');
      }

      setStage('complete');
      
      // Small delay before transitioning to show success
      setTimeout(() => {
        onUploadComplete(data);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setStage('error');
    }
  };

  const handleRetry = () => {
    setStage('idle');
    setError(null);
    setFileName(null);
  };

  const texts = {
    en: {
      title: 'Upload CV',
      description: 'Drop your CV here or click to browse',
      formats: 'Supports PDF and Word documents (max 10MB)',
      button: 'Select File',
    },
    da: {
      title: 'Upload CV',
      description: 'Træk dit CV hertil eller klik for at vælge',
      formats: 'Understøtter PDF og Word-dokumenter (max 10MB)',
      button: 'Vælg fil',
    },
  };

  const t = texts[language];

  // Loading state
  if (stage !== 'idle' && stage !== 'error' && stage !== 'complete') {
    return (
      <div className="space-y-4">
        {fileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}
        <LoadingState stage={stage} language={language} />
      </div>
    );
  }

  // Error state
  if (stage === 'error' && error) {
    return (
      <div className="space-y-4">
        {fileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}
        <AnalysisError error={error} onRetry={handleRetry} language={language} />
      </div>
    );
  }

  // Success state (brief)
  if (stage === 'complete') {
    return (
      <Card className="p-8 text-center border-green-500/50">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-green-500/10 p-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-lg font-medium text-green-600">
            {language === 'da' ? 'Analyse fuldført!' : 'Analysis complete!'}
          </p>
        </div>
      </Card>
    );
  }

  // Idle state - upload zone
  return (
    <Card
      className={cn(
        'relative border-2 border-dashed p-12 text-center transition-all cursor-pointer',
        'hover:border-primary/50 hover:bg-primary/5',
        isDragging && 'border-primary bg-primary/10 scale-[1.02]',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="flex flex-col items-center gap-4">
        <div className={cn(
          'rounded-full p-4 transition-all',
          isDragging ? 'bg-primary/20 scale-110' : 'bg-muted'
        )}>
          {isDragging ? (
            <FileText className="h-12 w-12 text-primary" />
          ) : (
            <Upload className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="text-lg font-medium">{t.title}</p>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </div>
        <p className="text-xs text-muted-foreground">{t.formats}</p>
        <Button variant="outline" className="pointer-events-none">
          {t.button}
        </Button>
      </div>
    </Card>
  );
}
