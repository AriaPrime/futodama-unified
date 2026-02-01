import mammoth from 'mammoth';

const MIN_TEXT_FOR_SUCCESS = 100;

interface ExtractionResult {
  text: string;
  method: 'pdfjs' | 'mammoth' | 'fallback';
  warnings: string[];
  pageCount?: number;
}

// ============================================
// PDF EXTRACTION
// ============================================

export async function extractPdfText(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];

  try {
    console.log('[PDF] Attempting pdf-parse extraction...');
    
    // Dynamic import with type assertion to handle ESM/CJS issues
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
    
    const data = await pdfParse(buffer);
    
    const text = data.text.trim();
    const pageCount = data.numpages;
    
    console.log('[PDF] Document has', pageCount, 'pages');

    if (text && text.length > MIN_TEXT_FOR_SUCCESS) {
      console.log('[PDF] Extraction successful:', text.length, 'chars');
      return {
        text,
        method: 'pdfjs',
        warnings,
        pageCount,
      };
    }

    // Minimal text - probably scanned document
    warnings.push('PDF appears to be scanned or image-based. OCR not configured.');
    console.log('[PDF] Extraction minimal:', text.length, 'chars');
    
    return {
      text: text || '',
      method: 'fallback',
      warnings,
      pageCount,
    };

  } catch (error) {
    console.error('[PDF] Extraction failed:', error);
    warnings.push(`PDF parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      text: '',
      method: 'fallback',
      warnings,
    };
  }
}

// ============================================
// WORD DOCUMENT EXTRACTION
// ============================================

export async function extractWordText(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  const warnings: string[] = [];
  const isLegacyDoc = mimeType === 'application/msword';

  if (isLegacyDoc) {
    warnings.push('Legacy .doc format detected - extraction may be limited');
  }

  try {
    console.log('[Word] Attempting mammoth extraction...');
    const result = await mammoth.extractRawText({ buffer });

    if (result.messages && result.messages.length > 0) {
      result.messages.forEach((msg: { type: string; message: string }) => {
        console.log('[Word] mammoth message:', msg.type, msg.message);
        if (msg.type === 'warning' || msg.type === 'error') {
          warnings.push(msg.message);
        }
      });
    }

    const text = result.value.trim();

    if (text.length >= MIN_TEXT_FOR_SUCCESS) {
      console.log('[Word] Extraction successful:', text.length, 'chars');
      return {
        text,
        method: 'mammoth',
        warnings,
      };
    }

    // Minimal text
    warnings.push('Word document extraction got minimal text');
    return {
      text: text || '',
      method: 'fallback',
      warnings,
    };

  } catch (error) {
    console.error('[Word] Extraction failed:', error);
    warnings.push(`Word extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`);

    return {
      text: '',
      method: 'fallback',
      warnings,
    };
  }
}

// ============================================
// MAIN EXTRACTION FUNCTION
// ============================================

export async function extractText(
  buffer: Buffer,
  mimeType: string,
  filename?: string
): Promise<ExtractionResult> {
  console.log('[Extract] Starting extraction for:', filename || 'unknown', 'type:', mimeType);

  if (mimeType === 'application/pdf') {
    return extractPdfText(buffer);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    return extractWordText(buffer, mimeType);
  }

  // Unsupported type
  return {
    text: '',
    method: 'fallback',
    warnings: [`Unsupported file type: ${mimeType}`],
  };
}
