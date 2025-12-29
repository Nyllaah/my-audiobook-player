/**
 * Utility functions for file operations
 */

/**
 * Checks if a file is an image based on its extension
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const extension = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return imageExtensions.includes(extension);
}

