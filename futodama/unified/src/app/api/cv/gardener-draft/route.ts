import { NextRequest, NextResponse } from 'next/server';
import { generateGardenerDraft } from '@/lib/llm/claude';
import { CVSection } from '@/types/cv';

export const runtime = 'nodejs';
export const maxDuration = 30;

interface GardenerDraftRequest {
  sectionId: string;
  section: CVSection;
}

export async function POST(request: NextRequest) {
  try {
    const body: GardenerDraftRequest = await request.json();
    const language = (request.headers.get('X-Language') || 'en') as 'en' | 'da';
    const model = request.headers.get('X-Model') || 'claude-sonnet-4-20250514';

    const { section } = body;

    if (!section) {
      return NextResponse.json(
        { error: 'Section is required' },
        { status: 400 }
      );
    }

    console.log('[GardenerDraft] Generating for section:', section.title);

    // Generate improved draft
    const content = await generateGardenerDraft(
      section,
      language,
      model
    );

    console.log('[GardenerDraft] Generated', content.length, 'characters');

    return NextResponse.json({ content });

  } catch (error) {
    console.error('[GardenerDraft] Error:', error);
    return NextResponse.json(
      { 
        error: 'Generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
