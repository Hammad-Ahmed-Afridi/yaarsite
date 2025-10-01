import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import imageCompression from 'browser-image-compression'; // Import the library

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .trim()
    .replace(/\s+/g, '-'); // Replace spaces with hyphens
}

/**
 * Generates a random alphanumeric string of a specified length.
 * @param length The desired length of the alphanumeric string.
 * @returns A random alphanumeric string.
 */
export function generateRandomAlphanumeric(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/**
 * Compresses an image file using browser-image-compression.
 * @param imageFile The File object to compress.
 * @returns A Promise that resolves to the compressed File object.
 */
export async function compressImage(imageFile: File): Promise<File> {
  const options = {
    maxSizeMB: 1,           // (max file size in MB)
    maxWidthOrHeight: 1000, // (max width or height in pixels)
    useWebWorker: true,     // (use web worker for faster compression)
    fileType: 'image/webp', // (output file type)
  };

  try {
    const compressedFile = await imageCompression(imageFile, options);
    console.log(`Original image size: ${imageFile.size / 1024 / 1024} MB`);
    console.log(`Compressed image size: ${compressedFile.size / 1024 / 1024} MB`);
    return compressedFile;
  } catch (error) {
    console.error('Error during image compression:', error);
    // If compression fails, return the original file
    return imageFile;
  }
}