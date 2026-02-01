import mammoth from 'mammoth';

const MIN_TEXT_FOR_SUCCESS = 100;

interface ExtractionResult {
  text: string;
  method: 'pdfjs' | 'mammoth' | 'fallback';
  warnings: string[];
  pageCount?: number;
}

// ============================================
// PDF EXTRACTION using pdfjs-dist legacy build
// ============================================

export async function extractPdfText(buffer: Buffer): Promise<ExtractionResult> {
  const warnings: string[] = [];

  try {
    console.log('[PDF] Attempting pdfjs-dist legacy extraction...');
    
    // Use the legacy build for Node.js environments
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
    
    // Convert Buffer to Uint8Array for pdfjs
    const uint8Array = new Uint8Array(buffer);
    
    // Load the PDF document with minimal options
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    
    console.log('[PDF] Document has', pageCount, 'pages');

    // Extract text from all pages
    const textParts: string[] = [];
    
    for (let i = 1; i <= pageCount; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Extract text items and join them
      const pageText = textContent.items
        .map((item: { str?: string }) => item.str || '')
        .join(' ');
      
      textParts.push(pageText);
    }
    
    const text = textParts.join('\n\n').trim();
    
    // Clean up excessive whitespace
    const cleanedText = text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (cleanedText && cleanedText.length > MIN_TEXT_FOR_SUCCESS) {
      console.log('[PDF] Extraction successful:', cleanedText.length, 'chars');
      return {
        text: cleanedText,
        method: 'pdfjs',
        warnings,
        pageCount,
      };
    }

    // Minimal text - probably scanned document
    warnings.push('PDF appears to be scanned or image-based. OCR not available.');
    console.log('[PDF] Extraction minimal:', cleanedText.length, 'chars');
    
    return {
      text: cleanedText || '',
      method: 'fallback',
      warnings,
      pageCount,
    };

  } catch (error) {
    console.error('[PDF] pdfjs-dist failed, trying pdf-parse fallback:', error);
    
    // Fallback to pdf-parse
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      
      const text = data.text?.trim() || '';
      const pageCount = data.numpages;
      
      if (text.length > MIN_TEXT_FOR_SUCCESS) {
        console.log('[PDF] pdf-parse fallback successful:', text.length, 'chars');
        return {
          text,
          method: 'pdfjs',
          warnings: ['Used pdf-parse fallback'],
          pageCount,
        };
      }
      
      warnings.push('PDF extraction got minimal text');
      return {
        text,
        method: 'fallback',
        warnings,
        pageCount,
      };
    } catch (fallbackError) {
      console.error('[PDF] All extraction methods failed:', fallbackError);
      warnings.push(`PDF parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        text: '',
        method: 'fallback',
        warnings,
      };
    }
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
