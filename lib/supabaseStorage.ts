import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseBucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'PVTB';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase client env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    }

    if (!supabaseClient) {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    }

    return supabaseClient;
}

function sanitizeFilename(name: string): string {
    return name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .replace(/-+/g, '-');
}

export async function uploadImageFromBrowser(file: File, folder = 'vehicles'): Promise<string> {
    const client = getSupabaseClient();
    const cleanName = sanitizeFilename(file.name || 'vehicle-image');
    const safeFolder = sanitizeFilename(folder || 'uploads') || 'uploads';
    const filePath = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${cleanName}`;

    const { error } = await client.storage.from(supabaseBucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
    });

    if (error) {
        throw new Error(error.message);
    }

    const { data } = client.storage.from(supabaseBucket).getPublicUrl(filePath);
    if (!data?.publicUrl) {
        throw new Error('Could not get public URL from Supabase storage.');
    }

    return data.publicUrl;
}

export async function uploadVehicleImageFromBrowser(file: File): Promise<string> {
    return uploadImageFromBrowser(file, 'vehicles');
}
