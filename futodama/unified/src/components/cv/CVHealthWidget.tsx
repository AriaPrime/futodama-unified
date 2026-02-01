'use client';

import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Observation } from '@/types/cv';

interface CVHealthWidgetProps {
  observations: Observation[];
  strengths: string[];
  onSelectObservation?: (sectionId: string) => void;
  language?: 'en' | 'da';
}

function calculateHealthScore(observations: Observation[]): number {
  if (observations.length === 0) return 100;
  
  // Start at 100, deduct based on observations
  const pendingObs = observations.filter(o => o.status === 'pending');
  const deduction = Math.min(pendingObs.length * 8, 60); // Max 60 point deduction
  
  return Math.max(40, 100 - deduction);
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
}

function getProgressColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

export function CVHealthWidget({ 
  observations, 
  strengths, 
  onSelectObservation,
  language = 'en' 
}: CVHealthWidgetProps) {
  const healthScore = calculateHealthScore(observations);
  const pendingObservations = observations.filter(o => o.status === 'pending');

  const texts = {
    en: {
      healthScore: 'Health Score',
      strengths: 'What works well',
      improvements: 'Suggested improvements',
      noImprovements: 'No improvements suggested',
    },
    da: {
      healthScore: 'Sundhedsscore',
      strengths: 'Hvad fungerer godt',
      improvements: 'Foreslåede forbedringer',
      noImprovements: 'Ingen forbedringer foreslået',
    },
  };

  const t = texts[language];

  return (
    <div className="space-y-4">
      {/* Health Score */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{t.healthScore}</span>
          <span className={cn('text-2xl font-bold', getScoreColor(healthScore))}>
            {healthScore}%
          </span>
        </div>
        <Progress 
          value={healthScore} 
          className="h-2"
          // Custom color based on score
          style={{
            ['--progress-background' as string]: getProgressColor(healthScore),
          }}
        />
      </Card>

      {/* Strengths */}
      {strengths.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">{t.strengths}</span>
          </div>
          <div className="space-y-2">
            {strengths.map((strength, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {strength}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Observations/Improvements */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium">{t.improvements}</span>
          {pendingObservations.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {pendingObservations.length}
            </span>
          )}
        </div>
        
        {pendingObservations.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noImprovements}</p>
        ) : (
          <div className="space-y-2">
            {pendingObservations.slice(0, 5).map((observation) => (
              <button
                key={observation.id}
                onClick={() => onSelectObservation?.(observation.sectionId)}
                className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground group-hover:text-primary">
                    {observation.message}
                  </span>
                </div>
              </button>
            ))}
            
            {pendingObservations.length > 5 && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                +{pendingObservations.length - 5} {language === 'da' ? 'mere' : 'more'}
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
