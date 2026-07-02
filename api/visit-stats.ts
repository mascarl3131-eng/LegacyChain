import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'mascarl3131@gmail.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
);

function dayKey(value: string) {
  return value.slice(0, 10);
}

function addCount(map: Record<string, number>, key: string | null | undefined) {
  const clean = key || 'direct';
  map[clean] = (map[clean] || 0) + 1;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
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
