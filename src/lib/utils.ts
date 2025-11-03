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
    maxSizeMB: 0.6,         // (max file size in MB, 600KB)
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

/**
 * Converts a HEX color string to an HSL string (e.g., "175 60% 40%").
 * Returns null if the input is invalid.
 * @param hex The HEX color string (e.g., "#RRGGBB" or "#RGB").
 * @returns An HSL string or null.
 */
export function hexToHsl(hex: string): string | null {
  if (!hex || typeof hex !== 'string') return null;

  let r = 0, g = 0, b = 0;

  // Handle #RGB format
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // Handle #RRGGBB format
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return null; // Invalid hex format
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

/**
 * Converts an HSL string (e.g., "175 60% 40%") to a HEX color string (e.g., "#RRGGBB").
 * Returns null if the input is invalid.
 * @param hsl The HSL color string.
 * @returns A HEX string or null.
 */
export function hslToHex(hsl: string): string | null {
  if (!hsl || typeof hsl !== 'string') return null;

  const parts = hsl.match(/(\d+)\s(\d+)%\s(\d+)%/);
  if (!parts || parts.length < 4) return null;

  let h = parseInt(parts[1]);
  let s = parseInt(parts[2]) / 100;
  let l = parseInt(parts[3]) / 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c / 2;
  let r_num = 0, g_num = 0, b_num = 0;

  if (0 <= h && h < 60) {
    r_num = c; g_num = x; b_num = 0;
  } else if (60 <= h && h < 120) {
    r_num = x; g_num = c; b_num = 0;
  } else if (120 <= h && h < 180) {
    r_num = 0; g_num = c; b_num = x;
  } else if (180 <= h && h < 240) {
    r_num = 0; g_num = x; b_num = c;
  } else if (240 <= h && h < 300) {
    r_num = x; g_num = 0; b_num = c;
  } else if (300 <= h && h < 360) {
    r_num = c; g_num = 0; b_num = x;
  }
  // Having obtained RGB, convert channels to hex
  let r_hex: string = Math.round((r_num + m) * 255).toString(16);
  let g_hex: string = Math.round((g_num + m) * 255).toString(16);
  let b_hex: string = Math.round((b_num + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r_hex.length === 1)
    r_hex = "0" + r_hex;
  if (g_hex.length === 1)
    g_hex = "0" + g_hex;
  if (b_hex.length === 1)
    b_hex = "0" + b_hex;

  return "#" + r_hex + g_hex + b_hex;
}

/**
 * Determines a contrasting text color (black or white) for a given background HEX color.
 * @param backgroundColorHex The HEX color string of the background.
 * @returns A HEX string, either '#000000' (black) or '#FFFFFF' (white).
 */
export function getContrastingTextColor(backgroundColorHex: string): string {
  // Convert HEX to RGB
  let r = 0, g = 0, b = 0;
  if (backgroundColorHex.length === 4) {
    r = parseInt(backgroundColorHex[1] + backgroundColorHex[1], 16);
    g = parseInt(backgroundColorHex[2] + backgroundColorHex[2], 16);
    b = parseInt(backgroundColorHex[3] + backgroundColorHex[3], 16);
  } else if (backgroundColorHex.length === 7) {
    r = parseInt(backgroundColorHex.substring(1, 3), 16);
    g = parseInt(backgroundColorHex.substring(3, 5), 16);
    b = parseInt(backgroundColorHex.substring(5, 7), 16);
  } else {
    return '#000000'; // Default to black for invalid hex
  }

  // Calculate luminance (Y = 0.2126 R + 0.7152 G + 0.0722 B)
  // Using sRGB luminance formula
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#222222' : '#FFFFFF'; // Using a slightly softer dark grey
}