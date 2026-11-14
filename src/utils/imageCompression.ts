/**
 * Client-Side Image Compression using HTML5 Canvas & WebP
 * Resizes max dimension to 1080px, targets quality < 200KB
 */

export interface CompressionResult {
  dataUrl: string;
  blob: Blob;
  originalSizeKb: number;
  compressedSizeKb: number;
  savingsPercent: number;
  width: number;
  height: number;
}

export async function compressImageClientSide(
  file: File,
  maxWidth = 1080,
  maxHeight = 1080,
  initialQuality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while clamping to max dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        // High quality bicubic image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to generate image blob'));
              return;
            }

            const compressedSizeKb = Math.round(blob.size / 1024);
            const savingsPercent = Math.max(
              0,
              Math.round(((originalSizeKb - compressedSizeKb) / originalSizeKb) * 100)
            );

            const readerForDataUrl = new FileReader();
            readerForDataUrl.onloadend = () => {
              resolve({
                dataUrl: readerForDataUrl.result as string,
                blob,
                originalSizeKb,
                compressedSizeKb,
                savingsPercent,
                width,
                height,
              });
            };
            readerForDataUrl.readAsDataURL(blob);
          },
          'image/webp',
          initialQuality
        );
      };

      img.onerror = () => reject(new Error('Error loading image into memory'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error reading image file'));
    reader.readAsDataURL(file);
  });
}
