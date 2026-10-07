export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' }
  });

async function userFromRequest(req, supabase) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data || !data.user) return null;
  return data.user;
}

async function isAdmin(userId, supabase) {
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', userId).maybeSingle();
  return !!data;
}

export async function requireUser(req, supabase) {
  const user = await userFromRequest(req, supabase);
  if (!user) return { error: json({ error: 'Sign in required.' }, 401) };
  return { user };
}

export async function requireAdmin(req, supabase) {
  const user = await userFromRequest(req, supabase);
  if (!user) return { error: json({ error: 'Sign in required.' }, 401) };
  if (!(await isAdmin(user.id, supabase))) return { error: json({ error: 'Not authorized.' }, 403) };
  return { user };
}

export function pick(obj, keys) {
  const out = {};
  keys.forEach(k => { if (obj && obj[k] !== undefined) out[k] = obj[k]; });
  return out;
}

export function corsHeaders(origin, allowed) {
  const list = String(allowed || '').split(',').map(s => s.trim()).filter(Boolean);
  const match = list.includes(origin) ? origin : (list[0] || '');
  return {
    'Access-Control-Allow-Origin': match,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'authorization,content-type',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}

export function withCors(response, origin, allowed) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(origin, allowed)).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
