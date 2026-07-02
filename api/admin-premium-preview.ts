import { createHash } from 'node:crypto';
import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'mascarl3131@gmail.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
);

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

function dayKey(value: string) {
  return value.slice(0, 10);
}

function addCount(map: Record<string, number>, key: string | null | undefined) {
  const clean = key || 'direct';
  map[clean] = (map[clean] || 0) + 1;
}

async function trackVisit(req: ApiRequest, res: ApiResponse) {
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

async function visitStats(req: ApiRequest, res: ApiResponse) {
  const user = await getAuthenticatedUser(req);
  const email = user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.has(email)) return res.status(403).json({ error: 'Administrator access required' });

  const admin = getAdminSupabase();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: total }, { count: last24h }, { data, error }] = await Promise.all([
    admin.from('page_views').select('id', { count: 'exact', head: true }),
    admin.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    admin.from('page_views').select('created_at,path,source,referrer,country,visitor_hash').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
  ]);

  if (error) return res.status(500).json({ error: error.message });

  const byDay: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byPath: Record<string, number> = {};
  const byCountry: Record<string, number> = {};
  const visitors = new Set<string>();

  for (const row of data || []) {
    addCount(byDay, dayKey(row.created_at));
    addCount(bySource, row.source || row.referrer);
    addCount(byPath, row.path);
    addCount(byCountry, row.country);
    if (row.visitor_hash) visitors.add(row.visitor_hash);
  }

  return res.status(200).json({
    total: total || 0,
    last24h: last24h || 0,
    last30d: data?.length || 0,
    uniqueLast30d: visitors.size,
    byDay,
    bySource,
    byPath,
    byCountry,
    recent: (data || []).slice(0, 12),
  });
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'POST' && req.body?.action === 'trackVisit') return trackVisit(req, res);
  if (req.method === 'GET' && req.query?.action === 'visitStats') return visitStats(req, res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await getAuthenticatedUser(req);
  const email = user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.has(email)) return res.status(403).json({ error: 'Administrator access required' });

  const enabled = Boolean(req.body?.enabled);
  return res.status(200).json({ ok: true, enabled, administrator: email });
}
