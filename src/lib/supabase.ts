import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Singleton pattern for Supabase client
let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false, // No auth needed for internal tool
      },
    });
  }
  return supabaseInstance;
}

export const supabase = getSupabase();

// Storage helpers
export const STORAGE_BUCKET = 'store-audit-photos';

export function getStorageUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

export async function uploadToStorage(
  path: string,
  file: File | Blob,
  contentType = 'image/webp'
): Promise<string> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return getStorageUrl(path);
}

export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path]);

  if (error) throw error;
}
