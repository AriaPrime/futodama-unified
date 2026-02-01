'use client';

import { FileUp, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  language?: 'en' | 'da';
}

export function EmptyState({ language = 'en' }: EmptyStateProps) {
  const texts = {
    en: {
      title: 'Analyze your CV',
      subtitle: 'Upload a CV to get AI-powered insights and improvement suggestions',
      features: [
        { icon: FileText, text: 'Parses any PDF or Word document' },
        { icon: Sparkles, text: 'AI identifies improvement opportunities' },
        { icon: CheckCircle, text: 'Get guided suggestions to strengthen your CV' },
      ],
    },
    da: {
      title: 'Analyser dit CV',
      subtitle: 'Upload et CV for at få AI-drevne indsigter og forbedringsforslag',
      features: [
        { icon: FileText, text: 'Parser enhver PDF eller Word-dokument' },
        { icon: Sparkles, text: 'AI identificerer forbedringsmuligheder' },
        { icon: CheckCircle, text: 'Få guidede forslag til at styrke dit CV' },
      ],
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="text-muted-foreground mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {t.features.map((feature, index) => (
          <Card key={index} className="p-4 text-center">
            <feature.icon className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-sm text-muted-foreground">{feature.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
