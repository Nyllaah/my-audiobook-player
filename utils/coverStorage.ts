import { Directory, File, Paths } from 'expo-file-system';
import { fetch } from 'expo/fetch';

const COVERS_DIR_NAME = 'covers';

/**
 * Copies an image from a picker URI (e.g. content:// or file://) into the app's
 * document directory so the URI stays valid across app restarts. Use this when
 * saving a custom cover so the notification and UI keep showing the right artwork.
 *
 * @param sourceUri - URI from ImagePicker or similar (can be temporary)
 * @param audiobookId - Used to form a stable filename so the same book always overwrites the same file
 * @returns The permanent file:// URI, or null if copy failed (caller can fall back to sourceUri)
 */
export async function copyCoverToAppStorage(
  sourceUri: string,
  audiobookId: string
): Promise<string | null> {
  if (!sourceUri || !audiobookId) return null;
  try {
    const dir = new Directory(Paths.document, COVERS_DIR_NAME);
    if (!dir.exists) {
      dir.create();
    }
    const ext = sourceUri.toLowerCase().includes('.png') ? 'png' : 'jpg';
    const destFile = new File(dir, `cover-${audiobookId}.${ext}`);

    const response = await fetch(sourceUri);
    if (!response.ok) return null;
    const bytes = await response.bytes();
    if (!bytes || bytes.byteLength === 0) return null;

    destFile.write(bytes);
    const uri = destFile.uri;
    return uri.startsWith('file://') ? uri : `file://${uri}`;
  } catch {
    return null;
  }
}

/**
 * Deletes the stored cover file for an audiobook (e.g. when user removes the cover).
 * No-op if the URI is not under our covers directory.
 */
export function deleteStoredCover(artworkUri: string | undefined): void {
  if (!artworkUri || !artworkUri.includes(`/${COVERS_DIR_NAME}/`)) return;
  try {
    const filename = artworkUri.split('/').pop();
    if (!filename) return;
    const dir = new Directory(Paths.document, COVERS_DIR_NAME);
    const file = new File(dir, filename);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // ignore
  }
}
