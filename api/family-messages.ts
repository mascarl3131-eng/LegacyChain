import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';
import { moderateText } from './_lib/moderation.js';

const EMOTIONS = new Set(['hope', 'love', 'wisdom', 'memory', 'warning']);
const TYPES = new Set(['standard', 'birth', 'capsule']);

function params(req: ApiRequest) {
  return new URL(req.url || '/', 'https://thechainlegacy.com').searchParams;
}

async function membership(admin: ReturnType<typeof getAdminSupabase>, familyId: string, userId: string) {
  const { data } = await admin.from('family_members').select('role').eq('family_id', familyId).eq('user_id', userId).maybeSingle();
  return data;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const admin = getAdminSupabase();

  if (req.method === 'GET') {
    const familyId = String(params(req).get('familyId') || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const { data, error } = await admin
      .from('family_messages')
      .select('id,author_name,message,emotion,message_type,unlock_year,baby_name,adulthood_year,photo_path,audio_path,created_at')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });

    const messages = await Promise.all((data || []).map(async row => {
      const paths = [row.photo_path, row.audio_path].filter(Boolean) as string[];
      const signed = paths.length
        ? await admin.storage.from('family-media').createSignedUrls(paths, 60 * 60)
        : { data: [] };
      const urls = new Map((signed.data || []).map(item => [item.path, item.signedUrl]));
      return {
        id: row.id,
        a: row.author_name,
        y: new Date(row.created_at).getFullYear(),
        text: row.message,
        e: row.emotion,
        type: row.message_type,
        lock: row.unlock_year,
        baby: row.baby_name,
        dy: row.adulthood_year,
        photo: row.photo_path ? urls.get(row.photo_path) || null : null,
        audioUrl: row.audio_path ? urls.get(row.audio_path) || null : null,
      };
    }));
    return res.status(200).json({ messages });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const familyId = String(body.familyId || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const message = String(body.message || '').trim();
    const emotion = String(body.emotion || '');
    const messageType = String(body.messageType || 'standard');
    const authorName = String(body.authorName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member').trim().slice(0, 80);
    const unlockYear = body.unlockYear ? Number(body.unlockYear) : null;
    const babyName = String(body.babyName || '').trim().slice(0, 80) || null;
    const adulthoodYear = body.adulthoodYear ? Number(body.adulthoodYear) : null;
    const photoPath = String(body.photoPath || '') || null;
    const audioPath = String(body.audioPath || '') || null;
    const expectedPrefix = `${familyId}/${user.id}/`;

    if (!message || message.length > 500 || !EMOTIONS.has(emotion) || !TYPES.has(messageType)) {
      return res.status(400).json({ error: 'Invalid family message' });
    }
    const moderation = moderateText(message);
    if (!moderation.allowed) return res.status(422).json({ error: 'Message rejected by safety moderation', reason: moderation.reason });
    if ((photoPath && !photoPath.startsWith(expectedPrefix)) || (audioPath && !audioPath.startsWith(expectedPrefix))) {
      return res.status(400).json({ error: 'Invalid media path' });
    }

    const { data, error } = await admin.from('family_messages').insert({
      family_id: familyId,
      author_id: user.id,
      author_name: authorName,
      message,
      emotion,
      message_type: messageType,
      unlock_year: unlockYear,
      baby_name: babyName,
      adulthood_year: adulthoodYear,
      photo_path: photoPath,
      audio_path: audioPath,
    }).select('id,created_at').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ id: data.id, createdAt: data.created_at });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
