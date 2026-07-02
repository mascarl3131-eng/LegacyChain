import { createHash } from 'node:crypto';
import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase } from './_lib/server.js';

function headerValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

function asText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function visitorHash(req: ApiRequest) {
  const forwarded = headerValue(req.headers['x-forwarded-for']).split(',')[0].trim();
  const ip = forwarded || req.socket.remoteAddress || '';
  const ua = headerValue(req.headers['user-agent']);
  const salt = process.env.VISIT_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'legacychain';
  return createHash('sha256').update(`${salt}:${ip}:${ua}`).digest('hex').slice(0, 32);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const path = asText(body.path, 240) || '/';
  const referrer = asText(body.referrer, 500);
  const source = asText(body.source, 80);
  const userAgent = headerValue(req.headers['user-agent']).slice(0, 300);
  const country = headerValue(req.headers['x-vercel-ip-country']).slice(0, 8);

  const { error } = await getAdminSupabase().from('page_views').insert({
    visitor_hash: visitorHash(req),
    path,
    source: source || null,
    referrer: referrer || null,
    user_agent: userAgent || null,
    country: country || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ ok: true });
}
