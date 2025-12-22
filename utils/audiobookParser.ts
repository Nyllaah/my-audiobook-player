import { AudiobookPart } from '@/types/audiobook';

/**
 * Extract numbers from filename for sorting
 * Handles patterns like: Part 1, Chapter 01, 001, Track 1, etc.
 */
export function extractPartNumber(filename: string): number | undefined {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Try to find common patterns
  const patterns = [
    /part[\s_-]*(\d+)/i,
    /chapter[\s_-]*(\d+)/i,
    /track[\s_-]*(\d+)/i,
    /(\d+)[\s_-]*of[\s_-]*\d+/i,
    /^(\d+)[\s_-]/,  // Number at start
    /[\s_-](\d+)$/,  // Number at end
    /(\d{2,})/,      // Any 2+ digit number
    /(\d+)/,         // Any number as fallback
  ];
  
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return undefined;
}

/**
 * Sort audio files by detected part numbers
 */
export function sortAudioFiles(files: { name: string; uri: string }[]): AudiobookPart[] {
  const parts: AudiobookPart[] = files.map((file) => ({
    uri: file.uri,
    filename: file.name,
    partNumber: extractPartNumber(file.name),
  }));
  
  // Sort by part number, then by filename
  parts.sort((a, b) => {
    if (a.partNumber !== undefined && b.partNumber !== undefined) {
      return a.partNumber - b.partNumber;
    }
    if (a.partNumber !== undefined) return -1;
    if (b.partNumber !== undefined) return 1;
    return a.filename.localeCompare(b.filename);
  });
  
  return parts;
}

/**
 * Detect if files belong to the same audiobook based on common naming patterns
 */
export function detectAudiobookTitle(files: { name: string }[]): string {
  if (files.length === 0) return 'Unknown Audiobook';
  if (files.length === 1) {
    return files[0].name.replace(/\.[^/.]+$/, '');
  }
  
  // Find common prefix among all filenames
  const names = files.map(f => f.name.replace(/\.[^/.]+$/, ''));
  let commonPrefix = names[0];
  
  for (let i = 1; i < names.length; i++) {
    let j = 0;
    while (j < commonPrefix.length && j < names[i].length && 
           commonPrefix[j].toLowerCase() === names[i][j].toLowerCase()) {
      j++;
    }
    commonPrefix = commonPrefix.substring(0, j);
  }
  
  // Clean up the common prefix
  commonPrefix = commonPrefix
    .replace(/[\s_-]+$/, '')  // Remove trailing separators
    .replace(/part$/i, '')
    .replace(/chapter$/i, '')
    .replace(/track$/i, '')
    .trim();
  
  return commonPrefix || 'Unknown Audiobook';
}

/**
 * Check if a filename is an audio file
 */
export function isAudioFile(filename: string): boolean {
  const audioExtensions = ['.mp3', '.m4a', '.m4b', '.aac', '.wav', '.flac', '.ogg', '.opus'];
  const ext = filename.toLowerCase().match(/\.[^/.]+$/)?.[0];
  return ext ? audioExtensions.includes(ext) : false;
}
