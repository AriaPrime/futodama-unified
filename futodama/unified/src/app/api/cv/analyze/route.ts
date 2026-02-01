import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractText } from '@/lib/engine/text-extractor';
import { parseWithLLM } from '@/lib/engine/llm-parser';
import { generateObservations, createObservation } from '@/lib/engine/observationGenerator';
import { phraseObservation, phraseStrengths, generateClaimBlocks, getSentenceStarters, calculateRepresentationStatus } from '@/lib/llm/claude';
import { CV, Observation, AnalyzeResponse } from '@/types/cv';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for analysis

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const language = (request.headers.get('X-Language') || 'en') as 'en' | 'da';
    const model = request.headers.get('X-Model') || 'claude-sonnet-4-20250514';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided', code: 'PARSE_FAILED' },
        { status: 400 }
      );
    }

    console.log('[Analyze] Starting analysis for:', file.name, 'language:', language);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from document
    const extraction = await extractText(buffer, file.type, file.name);
    
    if (!extraction.text || extraction.text.length < 100) {
      return NextResponse.json(
        { 
          error: 'Could not extract sufficient text from document',
          code: 'FILE_TOO_SHORT',
          details: extraction.warnings.join('; ')
        },
        { status: 400 }
      );
    }

    console.log('[Analyze] Extracted', extraction.text.length, 'characters via', extraction.method);

    // Parse into sections using LLM
    const parseResult = await parseWithLLM(extraction.text, model);
    
    if (parseResult.sections.length === 0) {
      return NextResponse.json(
        { 
          error: 'Could not parse CV into sections',
          code: 'PARSE_FAILED',
          details: parseResult.warnings.join('; ')
        },
        { status: 400 }
      );
    }

    console.log('[Analyze] Parsed', parseResult.sections.length, 'sections');

    // Generate raw observations from analyzers
    const rawObservations = generateObservations(parseResult.sections);
    console.log('[Analyze] Generated', rawObservations.length, 'raw observations');

    // Phrase observations and build full observation objects
    const observations: Observation[] = [];
    
    for (const raw of rawObservations.slice(0, 10)) { // Limit to top 10 observations
      try {
        // Phrase the observation - build context with required signal field
        const observationContext = {
          signal: raw.signal,
          ...raw.context as Record<string, unknown>,
        };
        const message = await phraseObservation(observationContext, language, model);
        
        // Find the section for guided edit context
        const section = parseResult.sections.find(s => s.id === raw.sectionId);
        
        // Generate claim blocks for guided editing
        let claimBlocks: string[] = [];
        if (section) {
          claimBlocks = await generateClaimBlocks(section, raw.signal, language, model);
        }
        
        // Get sentence starters
        const sentenceStarters = getSentenceStarters(raw.signal, language);
        
        // Calculate representation status
        const representationStatus = section 
          ? calculateRepresentationStatus(section.wordCount, section.duration || 0)
          : 'balanced';

        // Build the full observation
        const observation = createObservation(
          raw, 
          message, 
          undefined, // proposal
          'guided_edit', // actionType
          undefined, // inputPrompt
          undefined, // rewrittenContent
          {
            claimBlocks,
            sentenceStarters,
            representationStatus,
          }
        );
        
        observations.push(observation);
      } catch (error) {
        console.error('[Analyze] Failed to process observation:', error);
        // Continue with other observations
      }
    }

    console.log('[Analyze] Phrased', observations.length, 'observations');

    // Generate strengths
    const strengthSignals = rawObservations
      .filter(o => o.confidence > 0.7)
      .map(o => ({ signal: o.signal, context: o.context }));
    
    const sectionSummaries = parseResult.sections
      .filter(s => s.type === 'job')
      .slice(0, 3)
      .map(s => `${s.title} at ${s.organization || 'Unknown'}: ${s.content.substring(0, 100)}...`);

    let strengths: string[] = [];
    try {
      strengths = await phraseStrengths(strengthSignals, sectionSummaries, language, model);
    } catch (error) {
      console.error('[Analyze] Failed to generate strengths:', error);
      strengths = [language === 'da' 
        ? 'CV\'et præsenterer professionel erfaring i et klart format.'
        : 'This CV presents professional experience in a clear format.'];
    }

    // Build the CV object
    const cv: CV = {
      id: uuidv4(),
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
      rawText: extraction.text,
      sections: parseResult.sections,
      observations,
      strengths,
    };

    const response: AnalyzeResponse = {
      cv,
      observations,
      strengths,
    };

    console.log('[Analyze] Complete! CV id:', cv.id);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Analyze] Error:', error);
    return NextResponse.json(
      { 
        error: 'Analysis failed',
        code: 'ANALYSIS_FAILED',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
