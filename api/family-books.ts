import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

type FamilyBookRow = {
  family_id: string;
  author_id: string;
  author_name: string;
  data: Record<string, string> | null;
  updated_at: string;
};

function params(req: ApiRequest) {
  return new URL(req.url || '/', 'https://thechainlegacy.com').searchParams;
}

async function membership(admin: ReturnType<typeof getAdminSupabase>, familyId: string, userId: string) {
  const { data } = await admin.from('family_members').select('role').eq('family_id', familyId).eq('user_id', userId).maybeSingle();
  return data;
}

function sanitizeBookData(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const clean: Record<string, string> = {};
  Object.entries(value as Record<string, unknown>).slice(0, 200).forEach(([key, raw]) => {
    if (!/^\d+-\d+$/.test(key) || typeof raw !== 'string') return;
    const text = raw.trim().slice(0, 3000);
    if (text) clean[key] = text;
  });
  return clean;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const admin = getAdminSupabase();

  if (req.method === 'GET') {
    const familyId = String(params(req).get('familyId') || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const { data, error } = await admin
      .from('family_books')
      .select('family_id,author_id,author_name,data,updated_at')
      .eq('family_id', familyId)
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    const books = ((data || []) as FamilyBookRow[]).map(row => ({
      authorId: row.author_id,
      authorName: row.author_name,
      data: sanitizeBookData(row.data),
      updatedAt: row.updated_at,
      canEdit: row.author_id === user.id,
    }));
    return res.status(200).json({ books });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const familyId = String(body.familyId || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const authorName = String(body.authorName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member').trim().slice(0, 120);
    const data = sanitizeBookData(body.data);

    const { data: saved, error } = await admin
      .from('family_books')
      .upsert({
        family_id: familyId,
        author_id: user.id,
        author_name: authorName || 'Member',
        data,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'family_id,author_id' })
      .select('author_id,author_name,data,updated_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({
      book: {
        authorId: saved.author_id,
        authorName: saved.author_name,
        data: sanitizeBookData(saved.data),
        updatedAt: saved.updated_at,
        canEdit: true,
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
