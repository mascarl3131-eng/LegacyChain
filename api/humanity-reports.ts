import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const messageId = String(req.body?.messageId || '');
  const reason = String(req.body?.reason || '').trim().slice(0, 500);
  const visitorId = String(req.body?.visitorId || '').slice(0, 100);
  const user = await getAuthenticatedUser(req);
  if (!messageId || reason.length < 3 || (!user && !visitorId)) return res.status(400).json({ error: 'Invalid report' });

  const admin = getAdminSupabase();
  const match = user
    ? { message_id: messageId, reporter_id: user.id }
    : { message_id: messageId, visitor_id: visitorId };
  const { data: existing } = await admin.from('humanity_reports').select('id').match(match).maybeSingle();
  if (existing) return res.status(200).json({ ok: true, duplicate: true });

  const { error } = await admin.from('humanity_reports').insert({
    message_id: messageId,
    reporter_id: user?.id || null,
    visitor_id: user ? null : visitorId,
    reason,
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ ok: true });
}
