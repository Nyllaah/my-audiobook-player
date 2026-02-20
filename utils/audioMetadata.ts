import { getAudioMetadata } from '@missingcore/audio-metadata';
import * as FileSystem from 'expo-file-system';

const SUPPORTED_EXTENSIONS = ['mp3', 'm4a', 'mp4', 'flac'];

/**
 * Returns true if the file extension is supported for metadata extraction.
 */
export function isAudioFileWithMetadataSupport(uriOrFilename: string): boolean {
  const lower = uriOrFilename.toLowerCase();
  const ext = lower.includes('.') ? lower.split('.').pop() ?? '' : '';
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Returns true if the URI is likely readable by the native metadata module (file:// only).
 * content:// URIs on Android often cause FileNotFoundException in native code.
 */
function isFileUriSafeForMetadata(uri: string): boolean {
  return typeof uri === 'string' && uri.startsWith('file://');
}

/**
 * Extracts embedded artwork from an audio file's metadata (e.g. ID3 for MP3)
 * and saves it to the app cache. Returns the file URI for the saved image, or null.
 * Skips extraction for non-file URIs (e.g. content://) to avoid native FileNotFoundException.
 */
export async function getArtworkUriFromAudioFile(audioUri: string): Promise<string | null> {
  if (!isFileUriSafeForMetadata(audioUri) || !isAudioFileWithMetadataSupport(audioUri)) {
    return null;
  }
  try {
    const result = await getAudioMetadata(audioUri, ['artwork']);
    const artwork = result.metadata?.artwork;
    if (!artwork || typeof artwork !== 'string') {
      return null;
    }
    // Artwork is base64; may be raw base64 or data URL
    let base64Data = artwork;
    let extension = 'jpg';
    if (artwork.startsWith('data:')) {
      const match = artwork.match(/^data:image\/(\w+);base64,(.+)$/);
      if (match) {
        extension = match[1] === 'jpeg' ? 'jpg' : match[1];
        base64Data = match[2];
      }
    }
    const filename = `cover-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const path = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(path, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return path.startsWith('file://') ? path : `file://${path}`;
  } catch {
    return null;
  }
}
