import { json, requireAdmin } from '../middleware.js';

export async function handleBusiness(req, path, supabase) {
  const method = req.method;

  if (path === '/api/business' && method === 'GET') {
    const { data, error } = await supabase.from('business_info').select('data').eq('id', 1).maybeSingle();
    if (error) return json({ error: error.message }, 400);
    return json(data ? data.data : {});
  }

  if (path === '/api/business' && method === 'PUT') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const row = { id: 1, data: body || {}, updated_at: new Date().toISOString() };
    const { data, error: err } = await supabase.from('business_info').upsert(row).select('data').single();
    if (err) return json({ error: err.message }, 400);
    return json(data.data);
  }

  return json({ error: 'Not found.' }, 404);
}
