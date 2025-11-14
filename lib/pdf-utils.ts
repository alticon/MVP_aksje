import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker with multiple fallback strategies
if (typeof window !== 'undefined') {
  // Use jsdelivr CDN which is more reliable in production environments
  const version = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

  console.log('PDF.js version:', version);
  console.log('PDF.js worker configured:', pdfjsLib.GlobalWorkerOptions.workerSrc);
}

/**
 * Extracts text directly from a PDF file (faster than OCR)
 * @param file - The PDF file to extract text from
 * @param onProgress - Optional callback for progress updates
 * @returns The extracted text from all pages
 */
export async function extractTextFromPDF(
  file: File,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<string> {
  try {
    console.log('Starting PDF text extraction for:', file.name, file.type, file.size, 'bytes');

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF file read as ArrayBuffer, size:', arrayBuffer.byteLength);

    // Load the PDF document with better error handling
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0, // Reduce console noise
      useSystemFonts: true, // Better text extraction
    });

    // Add progress tracking for PDF loading
    loadingTask.onProgress = (progressData: any) => {
      console.log('PDF loading progress:', progressData);
    };

    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    let fullText = '';
    const totalPages = pdf.numPages;

    // Extract text from each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (onProgress) {
        onProgress({ current: pageNum, total: totalPages });
      }

      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine all text items with spaces
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += pageText + '\n';
      console.log(`Extracted ${pageText.length} characters from page ${pageNum}`);
    }

    console.log('PDF text extraction complete, total text length:', fullText.length);
    return fullText.trim();
  } catch (error) {
    console.error('PDF text extraction error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Re-throw the error so we can fallback to OCR
    throw error;
  }
}

/**
 * Converts a PDF file to an array of canvas elements (one per page)
 * @param file - The PDF file to convert
 * @param onProgress - Optional callback for progress updates
 * @returns Array of canvas elements, one for each page
 */
export async function pdfToCanvases(
  file: File,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<HTMLCanvasElement[]> {
  try {
    console.log('Starting PDF canvas conversion for:', file.name, file.type, file.size, 'bytes');

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF file read as ArrayBuffer, size:', arrayBuffer.byteLength);

    // Load the PDF document with better configuration
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      verbosity: 0, // Reduce console noise
      useSystemFonts: true,
      cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
    });

    // Add progress tracking for PDF loading
    loadingTask.onProgress = (progressData: any) => {
      console.log('PDF loading progress:', progressData);
    };

    const pdf = await loadingTask.promise;
    console.log('PDF loaded successfully, pages:', pdf.numPages);

    const canvases: HTMLCanvasElement[] = [];
    const totalPages = pdf.numPages;

    // Process each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      if (onProgress) {
        onProgress({ current: pageNum, total: totalPages });
      }

      const page = await pdf.getPage(pageNum);

      // Set scale for better OCR quality (higher = better quality but slower)
      const scale = 2.0;
      const viewport = page.getViewport({ scale });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      } as any; // Type assertion needed for pdfjs-dist compatibility

      await page.render(renderContext).promise;

      canvases.push(canvas);
    }

    console.log('PDF conversion complete, generated', canvases.length, 'canvas elements');
    return canvases;
  } catch (error) {
    console.error('PDF conversion error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Kunne ikke lese PDF-filen: ${error instanceof Error ? error.message : 'Ukjent feil'}. Prøv å ta et skjermbilde av PDF-en i stedet.`);
  }
}

/**
 * Converts a canvas to a Blob (image file)
 * @param canvas - The canvas to convert
 * @param type - The image MIME type (default: 'image/png')
 * @param quality - The image quality (0-1, default: 0.95)
 * @returns Promise resolving to a Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Converts a PDF file to image files (one per page)
 * @param file - The PDF file to convert
 * @param onProgress - Optional callback for progress updates
 * @returns Array of File objects (images), one for each page
 */
export async function pdfToImages(
  file: File,
  onProgress?: (progress: { current: number; total: number }) => void
): Promise<File[]> {
  const canvases = await pdfToCanvases(file, onProgress);

  const imageFiles: File[] = [];

  for (let i = 0; i < canvases.length; i++) {
    const blob = await canvasToBlob(canvases[i]);
    const imageFile = new File(
      [blob],
      `${file.name}_page_${i + 1}.png`,
      { type: 'image/png' }
    );
    imageFiles.push(imageFile);
  }

  return imageFiles;
}
