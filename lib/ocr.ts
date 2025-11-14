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
 * Converts PDF pages to images and runs OCR on them
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
    const { pdfToImages } = await import('./pdf-utils');

    // Step 1: Convert PDF to images
    if (onProgress) {
      onProgress({ status: 'Konverterer PDF til bilder...', progress: 10 });
    }

    const imageFiles = await pdfToImages(file, (pdfProgress) => {
      if (onProgress) {
        const progressPercent = 10 + (pdfProgress.current / pdfProgress.total) * 20;
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
    // If needed, we can extend this to process multiple pages
    if (onProgress) {
      onProgress({ status: 'Leser tekst fra PDF...', progress: 30 });
    }

    const firstPageImage = imageFiles[0];
    const text = await extractTextFromImage(firstPageImage, (ocrProgress) => {
      if (onProgress) {
        const progressPercent = 30 + (ocrProgress.progress / 100) * 70;
        onProgress({
          status: ocrProgress.status,
          progress: Math.round(progressPercent)
        });
      }
    });

    // If we have multiple pages and the first page didn't yield good results,
    // we could process more pages here
    // For now, we'll just use the first page

    return text;
  } catch (error) {
    console.error('PDF OCR error:', error);
    throw new Error('Kunne ikke lese PDF-filen. Prøv å ta et skjermbilde av sluttseddelen og last opp som bilde.');
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
