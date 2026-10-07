import { json, requireUser, requireAdmin, pick } from '../middleware.js';

async function isAdmin(supabase, userId) {
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle();
  return !!data;
}

export async function handleQuotes(req, path, supabase, env) {
  const method = req.method;

  if (path === '/api/quotes' && method === 'POST') {
    const { user, error } = await requireUser(req, supabase);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const row = Object.assign(
      pick(body, ['id', 'kind', 'client', 'cart', 'description', 'service_type', 'budget_range', 'timeline']),
      { user_id: user.id, user_email: user.email || null, status: 'new' }
    );
    if (!['materials', 'services'].includes(row.kind)) {
      return json({ error: 'kind must be "materials" or "services".' }, 400);
    }
    const { data, error: err } = await supabase.from('quote_requests').insert(row).select().single();
    if (err) return json({ error: err.message }, 400);
    return json(data, 201);
  }

  if (path === '/api/quotes' && method === 'GET') {
    const { user, error } = await requireUser(req, supabase);
    if (error) return error;
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    let q = supabase.from('quote_requests').select('*').order('created_at', { ascending: false });
    if (!(await isAdmin(supabase, user.id))) q = q.eq('user_id', user.id);
    if (status) q = q.eq('status', status);
    const { data, error: err } = await q;
    if (err) return json({ error: err.message }, 400);
    return json(data);
  }

  const one = path.match(/^\/api\/quotes\/([^/]+)$/);
  if (one && method === 'PATCH') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const body = await req.json().catch(() => ({}));
    const { data, error: err } = await supabase
      .from('quote_requests')
      .update(pick(body, ['status']))
      .eq('id', one[1])
      .select()
      .single();
    if (err) return json({ error: err.message }, 400);
    return json(data);
  }

  if (one && method === 'DELETE') {
    const { error } = await requireAdmin(req, supabase);
    if (error) return error;
    const { error: err } = await supabase.from('quote_requests').delete().eq('id', one[1]);
    if (err) return json({ error: err.message }, 400);
    return new Response(null, { status: 204 });
  }

  return json({ error: 'Not found.' }, 404);
}
