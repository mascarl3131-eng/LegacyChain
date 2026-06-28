import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

type TreeNodeRow = {
  id: number;
  n: string;
  b: number;
  x?: number;
  y?: number;
  gen: number;
};

type TreeLinkRow = [number, number];

function params(req: ApiRequest) {
  return new URL(req.url || '/', 'https://thechainlegacy.com').searchParams;
}

async function membership(admin: ReturnType<typeof getAdminSupabase>, familyId: string, userId: string) {
  const { data } = await admin.from('family_members').select('role').eq('family_id', familyId).eq('user_id', userId).maybeSingle();
  return data;
}

function asText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function asInt(value: unknown, fallback: number) {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeNodes(value: unknown): TreeNodeRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 120)
    .map((item, index) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: Math.max(1, asInt(row.id, index + 1)),
        n: asText(row.n, 120),
        b: asInt(row.b, new Date().getFullYear()),
        x: asInt(row.x, 0),
        y: asInt(row.y, 0),
        gen: Math.min(2, Math.max(0, asInt(row.gen, 1))),
      };
    })
    .filter(item => item.n);
}

function sanitizeLinks(value: unknown, nodes: TreeNodeRow[]): TreeLinkRow[] {
  if (!Array.isArray(value)) return [];
  const ids = new Set(nodes.map(node => node.id));
  return value
    .slice(0, 240)
    .map((item) => Array.isArray(item) ? [asInt(item[0], 0), asInt(item[1], 0)] as TreeLinkRow : [0, 0] as TreeLinkRow)
    .filter(([from, to]) => from > 0 && to > 0 && from !== to && ids.has(from) && ids.has(to));
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const admin = getAdminSupabase();

  if (req.method === 'GET') {
    const familyId = String(params(req).get('familyId') || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const { data, error } = await admin
      .from('family_trees')
      .select('nodes,links,updated_at')
      .eq('family_id', familyId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    const nodes = sanitizeNodes(data?.nodes);
    const links = sanitizeLinks(data?.links, nodes);
    return res.status(200).json({
      nodes,
      links,
      updatedAt: data?.updated_at || null,
    });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const familyId = String(body.familyId || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const nodes = sanitizeNodes(body.nodes);
    const links = sanitizeLinks(body.links, nodes);

    const { error } = await admin
      .from('family_trees')
      .upsert({
        family_id: familyId,
        nodes,
        links,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'family_id' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
