import { json, requireUser, requireAdmin, pick } from '../middleware.js';

export async function handleReviews(req, path, supabase) {
  const method = req.method;

  if (path === '/api/reviews' && method === 'GET') {
    const { data, error } = await supabase.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false });
    if (error) return json({ error: error.message }, 400);
    return json(data);
  }

  if (path === '/api/reviews/all' && method === 'GET') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const { data, error: err } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (err) return json({ error: err.message }, 400);
    return json(data);
  }

  if (path === '/api/reviews' && method === 'POST') {
    const { error } = await requireUser(req, supabase);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const row = Object.assign(pick(body, ['name', 'loc', 'stars', 'text']), { approved: false });
    const { data, error: err } = await supabase.from('reviews').insert(row).select().single();
    if (err) return json({ error: err.message }, 400);
    return json(data, 201);
  }

  const one = path.match(/^\/api\/reviews\/([^/]+)$/);
  if (one && method === 'PATCH') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const { data, error: err } = await supabase.from('reviews').update(pick(body, ['name', 'loc', 'stars', 'text', 'approved'])).eq('id', one[1]).select().single();
    if (err) return json({ error: err.message }, 400);
    return json(data);
  }

  if (one && method === 'DELETE') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const { error: err } = await supabase.from('reviews').delete().eq('id', one[1]);
    if (err) return json({ error: err.message }, 400);
    return new Response(null, { status: 204 });
  }

  return json({ error: 'Not found.' }, 404);
}
