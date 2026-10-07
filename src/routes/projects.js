import { json, requireAdmin, pick } from '../middleware.js';

const FIELDS = ['title', 'type', 'icon', 'image', 'description', 'budget', 'duration', 'year', 'client'];

export async function handleProjects(req, path, supabase) {
  const method = req.method;

  if (path === '/api/projects' && method === 'GET') {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
    if (error) return json({ error: error.message }, 400);
    return json(data);
  }

  if (path === '/api/projects' && method === 'POST') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const { data, error: err } = await supabase.from('projects').insert(pick(body, ['id'].concat(FIELDS))).select().single();
    if (err) return json({ error: err.message }, 400);
    return json(data, 201);
  }

  const one = path.match(/^\/api\/projects\/([^/]+)$/);
  if (one && method === 'PUT') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const { data, error: err } = await supabase.from('projects').update(pick(body, FIELDS)).eq('id', one[1]).select().single();
    if (err) return json({ error: err.message }, 400);
    return json(data);
  }

  if (one && method === 'DELETE') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const { error: err } = await supabase.from('projects').delete().eq('id', one[1]);
    if (err) return json({ error: err.message }, 400);
    return new Response(null, { status: 204 });
  }

  return json({ error: 'Not found.' }, 404);
}
