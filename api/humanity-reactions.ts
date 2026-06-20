import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const messageId = String(req.body?.messageId || '');
  const visitorId = String(req.body?.visitorId || '').slice(0, 100);
  const reaction = ['hope', 'love', 'support'].includes(String(req.body?.reaction)) ? String(req.body?.reaction) : 'support';
  const user = await getAuthenticatedUser(req);
  if (!messageId || (!user && !visitorId)) return res.status(400).json({ error: 'Invalid reaction' });

  const admin = getAdminSupabase();
  const identity = user ? { user_id: user.id, visitor_id: null } : { user_id: null, visitor_id: visitorId };
  const match = user ? { message_id: messageId, user_id: user.id, reaction } : { message_id: messageId, visitor_id: visitorId, reaction };
  const { data: existing } = await admin.from('humanity_reactions').select('id').match(match).maybeSingle();

  if (existing) await admin.from('humanity_reactions').delete().eq('id', existing.id);
  else await admin.from('humanity_reactions').insert({ message_id: messageId, reaction, ...identity });

  const { data: message } = await admin.from('humanity_messages').select('reaction_count').eq('id', messageId).single();
  return res.status(200).json({ active: !existing, count: message?.reaction_count || 0 });
}

