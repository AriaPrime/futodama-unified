'use client';

import { Loader2, FileText, Brain, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface LoadingStateProps {
  stage: 'uploading' | 'extracting' | 'parsing' | 'analyzing' | 'phrasing';
  language?: 'en' | 'da';
}

const stages = {
  uploading: { icon: FileText, progress: 10 },
  extracting: { icon: FileText, progress: 30 },
  parsing: { icon: Brain, progress: 50 },
  analyzing: { icon: Brain, progress: 70 },
  phrasing: { icon: Sparkles, progress: 90 },
};

const stageMessages = {
  en: {
    uploading: 'Uploading document...',
    extracting: 'Extracting text from document...',
    parsing: 'Parsing CV structure with AI...',
    analyzing: 'Running quality analyzers...',
    phrasing: 'Generating insights...',
  },
  da: {
    uploading: 'Uploader dokument...',
    extracting: 'Udtrækker tekst fra dokument...',
    parsing: 'Parser CV-struktur med AI...',
    analyzing: 'Kører kvalitetsanalysatorer...',
    phrasing: 'Genererer indsigter...',
  },
};

export function LoadingState({ stage, language = 'en' }: LoadingStateProps) {
  const [dots, setDots] = useState('');
  const config = stages[stage];
  const Icon = config.icon;
  const message = stageMessages[language][stage];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
          <div className="relative rounded-full bg-primary/10 p-4">
            <Icon className="h-8 w-8 text-primary animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium">{message}{dots}</p>
          <p className="text-sm text-muted-foreground">
            {language === 'da' 
              ? 'Dette kan tage op til 30 sekunder'
              : 'This may take up to 30 seconds'}
          </p>
        </div>

        <div className="w-full max-w-xs">
          <Progress value={config.progress} className="h-2" />
        </div>
      </div>
    </Card>
  );
}

interface AnalysisErrorProps {
  error: string;
  onRetry?: () => void;
  language?: 'en' | 'da';
}

export function AnalysisError({ error, onRetry, language = 'en' }: AnalysisErrorProps) {
  return (
    <Card className="p-8 text-center border-destructive/50">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <FileText className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-destructive">
            {language === 'da' ? 'Analyse fejlede' : 'Analysis failed'}
          </p>
          <p className="text-sm text-muted-foreground max-w-md">
            {error}
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-primary hover:underline"
          >
            {language === 'da' ? 'Prøv igen' : 'Try again'}
          </button>
        )}
      </div>
    </Card>
  );
}
