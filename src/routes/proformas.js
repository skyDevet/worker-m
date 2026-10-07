import { json, requireAdmin, pick } from '../middleware.js';

const FIELDS = ['number', 'status', 'source_request_id', 'client', 'lines', 'totals', 'terms', 'valid_days'];

export async function handleProformas(req, path, supabase) {
  const method = req.method;
  const { user, error } = await requireAdmin(req, supabase);
  if (error) return error;

  if (path === '/api/proformas' && method === 'GET') {
    const { data, error: err } = await supabase.from('proformas').select('*').order('created_at', { ascending: false });
    if (err) return json({ error: err.message }, 400);
    return json(data);
  }

  const one = path.match(/^\/api\/proformas\/([^/]+)$/);
  if (one && method === 'GET') {
    const { data, error: err } = await supabase.from('proformas').select('*').eq('id', one[1]).maybeSingle();
    if (err) return json({ error: err.message }, 400);
    if (!data) return json({ error: 'Not found.' }, 404);
    return json(data);
  }

  if (path === '/api/proformas' && method === 'POST') {
    const body = await req.json().catch(() => ({}));
    const row = Object.assign(pick(body, FIELDS), { created_by: user.id });
    const { data, error: err } = await supabase.from('proformas').insert(row).select().single();
    if (err) return json({ error: err.message }, 400);
    return json(data, 201);
  }

  if (one && method === 'PUT') {
    const body = await req.json().catch(() => ({}));
    const patch = Object.assign(pick(body, FIELDS), { updated_at: new Date().toISOString() });
    const { data, error: err } = await supabase.from('proformas').update(patch).eq('id', one[1]).select().single();
    if (err) return json({ error: err.message }, 400);
    return json(data);
  }

  if (one && method === 'DELETE') {
    const { error: err } = await supabase.from('proformas').delete().eq('id', one[1]);
    if (err) return json({ error: err.message }, 400);
    return new Response(null, { status: 204 });
  }

  return json({ error: 'Not found.' }, 404);
}
