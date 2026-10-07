import { json, requireAdmin } from '../middleware.js';

export async function handleUploads(req, path, supabase, env) {
  if (path !== '/api/uploads' || req.method !== 'POST') {
    return json({ error: 'Not found.' }, 404);
  }
  const { error } = await requireAdmin(req, supabase);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const filename = String(body.filename || '').trim();
  if (!filename) return json({ error: 'filename is required.' }, 400);

  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const folder = String(body.folder || 'misc').replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = folder + '/' + Date.now() + '-' + safe;
  const bucket = env.SUPABASE_STORAGE_BUCKET || 'uploads';

  const { data, error: err } = await supabase.storage.from(bucket).createSignedUploadUrl(filePath);
  if (err) return json({ error: err.message }, 400);

  const pub = supabase.storage.from(bucket).getPublicUrl(filePath);
  return json({ bucket, path: data.path, token: data.token, signedUrl: data.signedUrl, publicUrl: pub.data.publicUrl }, 201);
}
