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
 * Note: This is a basic implementation. For better PDF support, consider using PDF.js
 * @param file - The PDF file to process
 * @returns The extracted text
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // For now, we'll treat PDF as unsupported and ask user to convert to image
  throw new Error('PDF-støtte kommer snart. Vennligst last opp et bilde (JPG/PNG) av sluttseddelen.');
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

  if (fileType.includes('pdf')) {
    return extractTextFromPDF(file);
  } else if (fileType.includes('image') || fileType.includes('jpeg') || fileType.includes('jpg') || fileType.includes('png')) {
    return extractTextFromImage(file, onProgress);
  } else {
    throw new Error('Ugyldig filtype. Vennligst last opp et bilde (JPG/PNG) eller PDF.');
  }
}
