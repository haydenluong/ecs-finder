import 'server-only';
import { getSupabaseAdmin } from '@/../utils/supabase/admin';

const BUCKET = 'activity-images';

/**
 * Uploads are stored as `<uuid>.<ext>` and the `image` column holds the public
 * URL ending in that filename, so the storage path is the URL's last segment.
 */
export function storagePathFromUrl(imageUrl: string | null | undefined): string | null {
    if (!imageUrl) return null;
    try {
        const segments = new URL(imageUrl).pathname.split('/');
        const filename = segments[segments.length - 1];
        return filename ? decodeURIComponent(filename) : null;
    } catch {
        return null;
    }
}

/**
 * Never throws: a failed storage delete must not undo the decision that
 * triggered it — the row is already archived or rejected either way.
 */
export async function deleteActivityImages(imageUrls: (string | null | undefined)[]): Promise<number> {
    const paths = imageUrls.map(storagePathFromUrl).filter((p): p is string => p !== null);
    if (paths.length === 0) return 0;

    const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove(paths);
    if (error) {
        console.error('Failed to delete activity images:', error);
        return 0;
    }
    return paths.length;
}
