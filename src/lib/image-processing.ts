// ============================================
// Image Processing Utilities
// Client-side compression and thumbnail generation
// ============================================

import imageCompression from 'browser-image-compression';

const MAX_SIZE_MB = 1;
const MAX_WIDTH_PX = 1920;
const THUMBNAIL_WIDTH_PX = 200;
const QUALITY = 0.8;

export interface ProcessedImage {
  full: Blob;
  thumbnail: Blob;
}

/**
 * Compress an image file to WebP format
 */
export async function compressImage(file: File): Promise<Blob> {
  const options = {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_PX,
    useWebWorker: true,
    fileType: 'image/webp' as const,
    initialQuality: QUALITY,
  };

  const compressedFile = await imageCompression(file, options);
  return compressedFile;
}

/**
 * Generate a thumbnail from an image file
 */
export async function generateThumbnail(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate dimensions maintaining aspect ratio
      const aspectRatio = img.width / img.height;
      let width = THUMBNAIL_WIDTH_PX;
      let height = THUMBNAIL_WIDTH_PX / aspectRatio;

      if (height > THUMBNAIL_WIDTH_PX) {
        height = THUMBNAIL_WIDTH_PX;
        width = THUMBNAIL_WIDTH_PX * aspectRatio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and convert to WebP
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not generate thumbnail'));
          }
        },
        'image/webp',
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    img.src = url;
  });
}

/**
 * Process an image: compress full size and generate thumbnail
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  const [full, thumbnail] = await Promise.all([
    compressImage(file),
    generateThumbnail(file),
  ]);

  return { full, thumbnail };
}

/**
 * Convert a base64 string to a File object
 */
export function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Get image dimensions from a file
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    img.src = url;
  });
}
