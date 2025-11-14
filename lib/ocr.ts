import Tesseract from 'tesseract.js';

export interface OCRProgress {
  status: string;
  progress: number;
}

/**
 * Extracts text from an image file using OCR
 * @param file - The image file to process (JPEG, PNG, etc.)
 * @param onProgress - Optional callback for progress updates
 * @returns The extracted text
 */
export async function extractTextFromImage(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  try {
    // Create a worker for Tesseract
    const worker = await Tesseract.createWorker('nor+eng', 1, {
      logger: (m) => {
        if (onProgress && m.status && m.progress !== undefined) {
          onProgress({
            status: m.status,
            progress: Math.round(m.progress * 100)
          });
        }
      }
    });

    // Perform OCR
    const { data } = await Tesseract.recognize(file);

    // Terminate the worker
    await worker.terminate();

    return data.text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Kunne ikke lese tekst fra bildet. Vennligst prøv igjen eller fyll ut manuelt.');
  }
}

/**
 * Extracts text from a PDF file
 * First tries direct text extraction (fast), then falls back to OCR if needed
 * @param file - The PDF file to process
 * @param onProgress - Optional callback for progress updates
 * @returns The extracted text from all pages
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  try {
    // Dynamically import PDF utilities (client-side only)
    const pdfUtils = await import('./pdf-utils');

    // Step 1: Try direct text extraction first (much faster and more reliable)
    if (onProgress) {
      onProgress({ status: 'Leser tekst fra PDF...', progress: 10 });
    }

    try {
      console.log('Attempting direct PDF text extraction...');
      const extractedText = await pdfUtils.extractTextFromPDF(file, (pdfProgress) => {
        if (onProgress) {
          const progressPercent = 10 + (pdfProgress.current / pdfProgress.total) * 60;
          onProgress({
            status: `Leser side ${pdfProgress.current} av ${pdfProgress.total}...`,
            progress: Math.round(progressPercent)
          });
        }
      });

      // Check if we got meaningful text (at least 20 characters)
      if (extractedText && extractedText.length > 20) {
        console.log('Direct PDF text extraction successful, length:', extractedText.length);
        if (onProgress) {
          onProgress({ status: 'Tekst hentet fra PDF!', progress: 100 });
        }
        return extractedText;
      } else {
        console.log('Direct text extraction yielded insufficient text, falling back to OCR');
        throw new Error('Insufficient text extracted, falling back to OCR');
      }
    } catch (textExtractionError) {
      // If direct text extraction fails, fall back to OCR
      console.log('Direct text extraction failed, attempting OCR fallback:', textExtractionError);

      if (onProgress) {
        onProgress({ status: 'Konverterer PDF til bilder for OCR...', progress: 20 });
      }

      const imageFiles = await pdfUtils.pdfToImages(file, (pdfProgress) => {
        if (onProgress) {
          const progressPercent = 20 + (pdfProgress.current / pdfProgress.total) * 20;
          onProgress({
            status: `Konverterer side ${pdfProgress.current} av ${pdfProgress.total}...`,
            progress: Math.round(progressPercent)
          });
        }
      });

      if (imageFiles.length === 0) {
        throw new Error('Ingen sider funnet i PDF-en');
      }

      // Step 2: Run OCR on first page (most sluttsedler are single page)
      if (onProgress) {
        onProgress({ status: 'Kjører OCR på PDF...', progress: 40 });
      }

      const firstPageImage = imageFiles[0];
      const text = await extractTextFromImage(firstPageImage, (ocrProgress) => {
        if (onProgress) {
          const progressPercent = 40 + (ocrProgress.progress / 100) * 60;
          onProgress({
            status: ocrProgress.status,
            progress: Math.round(progressPercent)
          });
        }
      });

      console.log('OCR fallback successful, text length:', text.length);
      return text;
    }
  } catch (error) {
    console.error('PDF processing error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Kunne ikke lese PDF-filen. Prøv å ta et skjermbilde av sluttseddelen og last opp som bilde i stedet.');
  }
}

/**
 * Main function to extract text from any supported file type
 * @param file - The file to process
 * @param onProgress - Optional callback for progress updates
 * @returns The extracted text
 */
export async function extractText(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  const fileType = file.type.toLowerCase();

  if (fileType.includes('pdf') || file.name.toLowerCase().endsWith('.pdf')) {
    return extractTextFromPDF(file, onProgress);
  } else if (fileType.includes('image') || fileType.includes('jpeg') || fileType.includes('jpg') || fileType.includes('png')) {
    return extractTextFromImage(file, onProgress);
  } else {
    throw new Error('Ugyldig filtype. Vennligst last opp et bilde (JPG/PNG) eller PDF.');
  }
}
