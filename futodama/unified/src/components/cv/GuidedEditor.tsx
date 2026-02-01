'use client';

import { useState } from 'react';
import { Sparkles, Check, X, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CVSection, Observation, GuidedEditContext } from '@/types/cv';

interface GuidedEditorProps {
  section: CVSection;
  observation: Observation;
  onApply: (newContent: string) => void;
  onCancel: () => void;
  language?: 'en' | 'da';
}

export function GuidedEditor({ 
  section, 
  observation, 
  onApply, 
  onCancel,
  language = 'en' 
}: GuidedEditorProps) {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);
  const [starterIndex, setStarterIndex] = useState(0);

  const guidedEdit = observation.guidedEdit as GuidedEditContext | undefined;
  const claimBlocks = guidedEdit?.claimBlocks || [];
  const sentenceStarters = guidedEdit?.sentenceStarters || [];
  const representationStatus = guidedEdit?.representationStatus || 'balanced';

  const texts = {
    en: {
      title: 'Improve this section',
      claimsLabel: 'Click to add suggested elements:',
      inputLabel: 'Add your own details:',
      inputPlaceholder: 'Type additional information about this role...',
      generateButton: 'Generate improved version',
      gardenerButton: 'Auto-improve with AI',
      applyButton: 'Apply changes',
      cancelButton: 'Cancel',
      preview: 'Preview',
      original: 'Original',
      generating: 'Generating...',
      statusShort: 'This section could use more detail',
      statusLong: 'This section is quite detailed',
      statusBalanced: 'Good length for this role',
    },
    da: {
      title: 'Forbedre denne sektion',
      claimsLabel: 'Klik for at tilføje foreslåede elementer:',
      inputLabel: 'Tilføj dine egne detaljer:',
      inputPlaceholder: 'Skriv yderligere information om denne rolle...',
      generateButton: 'Generer forbedret version',
      gardenerButton: 'Auto-forbedre med AI',
      applyButton: 'Anvend ændringer',
      cancelButton: 'Annuller',
      preview: 'Forhåndsvisning',
      original: 'Original',
      generating: 'Genererer...',
      statusShort: 'Denne sektion kunne bruge flere detaljer',
      statusLong: 'Denne sektion er ret detaljeret',
      statusBalanced: 'God længde for denne rolle',
    },
  };

  const t = texts[language];

  const toggleClaim = (claim: string) => {
    setSelectedClaims(prev => 
      prev.includes(claim) 
        ? prev.filter(c => c !== claim)
        : [...prev, claim]
    );
  };

  const cycleStarter = () => {
    if (sentenceStarters.length > 0) {
      setStarterIndex((prev) => (prev + 1) % sentenceStarters.length);
      // Add starter to input if empty
      if (!userInput) {
        setUserInput(sentenceStarters[(starterIndex + 1) % sentenceStarters.length]);
      }
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/cv/apply-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Language': language,
        },
        body: JSON.stringify({
          sectionId: section.id,
          section: section,
          claims: selectedClaims,
          userInput: userInput,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGardenerDraft = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/cv/gardener-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Language': language,
        },
        body: JSON.stringify({
          sectionId: section.id,
          section: section,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedContent) {
      onApply(generatedContent);
    }
  };

  const statusMessage = representationStatus === 'too_short' ? t.statusShort
    : representationStatus === 'too_long' ? t.statusLong
    : t.statusBalanced;

  return (
    <Card className="p-4 border-primary/20 bg-primary/5">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">{t.title}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {statusMessage}
          </Badge>
        </div>

        {/* Observation message */}
        <p className="text-sm text-muted-foreground">
          {observation.message}
        </p>

        {/* Claim blocks */}
        {claimBlocks.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">{t.claimsLabel}</p>
            <div className="flex flex-wrap gap-2">
              {claimBlocks.map((claim, index) => (
                <button
                  key={index}
                  onClick={() => toggleClaim(claim)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-full border transition-colors',
                    selectedClaims.includes(claim)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-border'
                  )}
                >
                  {claim}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* User input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">{t.inputLabel}</p>
            {sentenceStarters.length > 0 && (
              <button
                onClick={cycleStarter}
                className="text-xs text-primary hover:underline"
              >
                {language === 'da' ? 'Forslag' : 'Suggestion'} →
              </button>
            )}
          </div>
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={sentenceStarters[starterIndex] || t.inputPlaceholder}
            className="min-h-[80px] text-sm"
          />
        </div>

        {/* Generate buttons */}
        {!generatedContent && (
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || (selectedClaims.length === 0 && !userInput)}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.generating}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t.generateButton}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleGardenerDraft}
              disabled={isGenerating}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {t.gardenerButton}
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Preview */}
        {generatedContent && (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t.preview}</p>
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{generatedContent}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">{t.original}</p>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {generatedContent ? (
            <>
              <Button onClick={handleApply} className="flex-1">
                <Check className="h-4 w-4 mr-2" />
                {t.applyButton}
              </Button>
              <Button variant="outline" onClick={() => setGeneratedContent(null)}>
                {language === 'da' ? 'Prøv igen' : 'Try again'}
              </Button>
            </>
          ) : null}
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t.cancelButton}
          </Button>
        </div>
      </div>
    </Card>
  );
}
