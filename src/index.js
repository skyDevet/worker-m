import { getSupabase } from './supabase.js';
import { json, withCors } from './middleware.js';
import { handleQuotes } from './routes/quotes.js';
import { handleProformas } from './routes/proformas.js';
import { handleProjects } from './routes/projects.js';
import { handleReviews } from './routes/reviews.js';
import { handleBusiness } from './routes/business.js';
import { handleUploads } from './routes/uploads.js';

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const path = url.pathname;
    const origin = req.headers.get('origin') || '';

    if (req.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), origin, env.CORS_ORIGIN);
    }

    const run = async () => {
      if (path === '/api/health' && req.method === 'GET') {
        return json({ ok: true });
      }

      if (!path.startsWith('/api/')) {
        return json({ error: 'Not found.' }, 404);
      }

      const supabase = getSupabase(env);
      if (!supabase) {
        return json({ error: 'Supabase is not configured on the server.' }, 503);
      }

      if (path.startsWith('/api/quotes'))    return handleQuotes(req, path, supabase, env);
      if (path.startsWith('/api/proformas')) return handleProformas(req, path, supabase, env);
      if (path.startsWith('/api/projects'))  return handleProjects(req, path, supabase, env);
      if (path.startsWith('/api/reviews'))   return handleReviews(req, path, supabase, env);
      if (path.startsWith('/api/business'))  return handleBusiness(req, path, supabase, env);
      if (path.startsWith('/api/uploads'))   return handleUploads(req, path, supabase, env);

      return json({ error: 'Not found.' }, 404);
    };

    try {
      const res = await run();
      return withCors(res, origin, env.CORS_ORIGIN);
    } catch (err) {
      console.error(err);
      return withCors(json({ error: 'Server error.' }, 500), origin, env.CORS_ORIGIN);
    }
  }
};
