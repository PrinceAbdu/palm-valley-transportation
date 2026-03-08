import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const DEFAULT_BUCKET = process.env.SUPABASE_BUCKET || 'PVTB';

function safeFilename(name: string): string {
    return name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .replace(/-+/g, '-');
}

function inferExtension(filename: string, contentType?: string): string {
    const fromName = path.extname(filename || '').replace('.', '').toLowerCase();
    if (fromName) return fromName;

    if (!contentType) return 'jpg';
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('gif')) return 'gif';
    return 'jpg';
}

function persistLocally(buffer: Buffer, preferredName: string): { url: string; filename: string; provider: 'local' } {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = safeFilename(preferredName);
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    return {
        url: `/uploads/${filename}`,
        filename,
        provider: 'local',
    };
}

export async function uploadImage(buffer: Buffer, originalName: string, contentType?: string): Promise<{
    url: string;
    filename: string;
    provider: 'supabase' | 'local';
}> {
    const ext = inferExtension(originalName, contentType);
    const baseName = safeFilename(path.basename(originalName || `upload.${ext}`, path.extname(originalName || '')) || 'upload');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${baseName}.${ext}`;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceRoleKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
        const bucket = DEFAULT_BUCKET;
        const objectPath = `vehicles/${filename}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(objectPath, buffer, {
                contentType: contentType || 'application/octet-stream',
                upsert: false,
            });

        if (error) {
            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        const publicUrlData = supabase.storage.from(bucket).getPublicUrl(objectPath);
        return {
            url: publicUrlData.data.publicUrl,
            filename: objectPath,
            provider: 'supabase',
        };
    }

    return persistLocally(buffer, filename);
}
