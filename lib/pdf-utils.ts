import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
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
    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

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

    return canvases;
  } catch (error) {
    console.error('PDF conversion error:', error);
    throw new Error('Kunne ikke lese PDF-filen. Kontroller at filen er en gyldig PDF.');
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
