"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = uploadImage;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const supabase_js_1 = require("@supabase/supabase-js");
const DEFAULT_BUCKET = process.env.SUPABASE_BUCKET || 'PVTB';
function safeFilename(name) {
    return name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '')
        .replace(/-+/g, '-');
}
function inferExtension(filename, contentType) {
    const fromName = path_1.default.extname(filename || '').replace('.', '').toLowerCase();
    if (fromName)
        return fromName;
    if (!contentType)
        return 'jpg';
    if (contentType.includes('png'))
        return 'png';
    if (contentType.includes('webp'))
        return 'webp';
    if (contentType.includes('gif'))
        return 'gif';
    return 'jpg';
}
function persistLocally(buffer, preferredName) {
    const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    const filename = safeFilename(preferredName);
    const filePath = path_1.default.join(uploadsDir, filename);
    fs_1.default.writeFileSync(filePath, buffer);
    return {
        url: `/uploads/${filename}`,
        filename,
        provider: 'local',
    };
}
async function uploadImage(buffer, originalName, contentType) {
    const ext = inferExtension(originalName, contentType);
    const baseName = safeFilename(path_1.default.basename(originalName || `upload.${ext}`, path_1.default.extname(originalName || '')) || 'upload');
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${baseName}.${ext}`;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseServiceRoleKey) {
        const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
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
