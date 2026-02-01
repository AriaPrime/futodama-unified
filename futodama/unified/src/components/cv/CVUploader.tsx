'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CVUploaderProps {
  onUploadComplete: (data: unknown) => void;
  language?: 'en' | 'da';
}

export function CVUploader({ onUploadComplete, language = 'en' }: CVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(language === 'da'
        ? 'Filen er for stor (max 10MB)'
        : 'File is too large (max 10MB)');
      return;
    }

    setError(null);
    setIsUploading(true);

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
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const texts = {
    en: {
      title: 'Upload CV',
      description: 'Drop your CV here or click to browse',
      formats: 'Supports PDF and Word documents',
      uploading: 'Analyzing...',
      button: 'Select File',
    },
    da: {
      title: 'Upload CV',
      description: 'Træk dit CV hertil eller klik for at vælge',
      formats: 'Understøtter PDF og Word-dokumenter',
      uploading: 'Analyserer...',
      button: 'Vælg fil',
    },
  };

  const t = texts[language];

  return (
    <Card
      className={cn(
        'relative border-2 border-dashed p-12 text-center transition-colors',
        isDragging && 'border-primary bg-primary/5',
        isUploading && 'opacity-75 pointer-events-none'
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
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-medium">{t.uploading}</p>
            <p className="text-sm text-muted-foreground">
              {language === 'da' 
                ? 'Dette kan tage op til 30 sekunder...'
                : 'This may take up to 30 seconds...'}
            </p>
          </>
        ) : (
          <>
            <div className={cn(
              'rounded-full p-4 transition-colors',
              isDragging ? 'bg-primary/20' : 'bg-muted'
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
          </>
        )}

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>
    </Card>
  );
}
