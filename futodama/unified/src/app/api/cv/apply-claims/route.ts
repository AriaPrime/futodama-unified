import { NextRequest, NextResponse } from 'next/server';
import { generateFromUserInput } from '@/lib/llm/claude';
import { CVSection } from '@/types/cv';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface ApplyClaimsRequest {
  sectionId: string;
  section: CVSection;
  claims: string[];
  userInput: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ApplyClaimsRequest = await request.json();
    const language = (request.headers.get('X-Language') || 'en') as 'en' | 'da';
    const model = request.headers.get('X-Model') || 'claude-sonnet-4-20250514';

    const { section, claims, userInput } = body;

    if (!section) {
      return NextResponse.json(
        { error: 'Section is required' },
        { status: 400 }
      );
    }

    // Combine claims and user input into a single prompt
    const combinedInput = [
      ...claims,
      userInput,
    ].filter(Boolean).join('\n');

    if (!combinedInput) {
      return NextResponse.json(
        { error: 'No claims or input provided' },
        { status: 400 }
      );
    }

    console.log('[ApplyClaims] Generating for section:', section.title);
    console.log('[ApplyClaims] Claims:', claims);
    console.log('[ApplyClaims] User input:', userInput);

    // Generate enhanced content
    const content = await generateFromUserInput(
      section,
      combinedInput,
      language,
      model
    );

    console.log('[ApplyClaims] Generated', content.length, 'characters');

    return NextResponse.json({ content });

  } catch (error) {
    console.error('[ApplyClaims] Error:', error);
    return NextResponse.json(
      { 
        error: 'Generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
