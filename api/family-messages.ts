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

function isMissingVideoPathError(error: { message?: string; details?: string; hint?: string; code?: string } | null) {
  const text = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
  return text.includes('video_path') || error?.code === '42703';
}

function mediaKind(path: string | null | undefined, videoPath: string | null | undefined) {
  if (!path) return 'none';
  if (videoPath === path) return 'video';
  const file = path.split('/').pop() || '';
  if (file.startsWith('video-') || /\.(mp4|mov)$/i.test(file)) return 'video';
  return 'audio';
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const admin = getAdminSupabase();
  const currentYear = new Date().getFullYear();

  if (req.method === 'GET') {
    const familyId = String(params(req).get('familyId') || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    let { data, error }: { data: any[] | null; error: any } = await admin
      .from('family_messages')
      .select('id,author_name,message,emotion,message_type,unlock_year,baby_name,adulthood_year,photo_path,audio_path,video_path,created_at')
      .eq('family_id', familyId)
      .or(`unlock_year.is.null,unlock_year.lte.${currentYear}`)
      .order('created_at', { ascending: false })
      .limit(200);
    if (error && isMissingVideoPathError(error)) {
      const fallback = await admin
        .from('family_messages')
        .select('id,author_name,message,emotion,message_type,unlock_year,baby_name,adulthood_year,photo_path,audio_path,created_at')
        .eq('family_id', familyId)
        .or(`unlock_year.is.null,unlock_year.lte.${currentYear}`)
        .order('created_at', { ascending: false })
        .limit(200);
      data = fallback.data;
      error = fallback.error;
    }
    if (error) return res.status(500).json({ error: error.message });

    const messages = await Promise.all((data || []).map(async row => {
      const rowVideoPath = 'video_path' in row ? row.video_path : null;
      const rowAudioKind = mediaKind(row.audio_path, rowVideoPath);
      const paths = [row.photo_path, row.audio_path, rowVideoPath].filter(Boolean) as string[];
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
        audioUrl: row.audio_path && rowAudioKind === 'audio' ? urls.get(row.audio_path) || null : null,
        videoUrl: rowVideoPath
          ? urls.get(rowVideoPath) || null
          : row.audio_path && rowAudioKind === 'video'
            ? urls.get(row.audio_path) || null
            : null,
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
    const videoPath = String(body.videoPath || '') || null;
    const expectedPrefix = `${familyId}/${user.id}/`;

    if (!message || message.length > 500 || !EMOTIONS.has(emotion) || !TYPES.has(messageType)) {
      return res.status(400).json({ error: 'Invalid family message' });
    }
    const moderation = moderateText(message);
    if (!moderation.allowed) return res.status(422).json({ error: 'Message rejected by safety moderation', reason: moderation.reason });
    if (
      (photoPath && !photoPath.startsWith(expectedPrefix))
      || (audioPath && !audioPath.startsWith(expectedPrefix))
      || (videoPath && !videoPath.startsWith(expectedPrefix))
    ) {
      return res.status(400).json({ error: 'Invalid media path' });
    }

    const insertPayload = {
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
      video_path: videoPath,
    };
    let { data, error } = await admin.from('family_messages').insert(insertPayload).select('id,created_at').single();
    if (error && videoPath && isMissingVideoPathError(error) && !audioPath) {
      const { video_path: _videoPath, ...fallbackPayload } = insertPayload;
      const fallback = await admin.from('family_messages').insert({
        ...fallbackPayload,
        audio_path: videoPath,
      }).select('id,created_at').single();
      data = fallback.data;
      error = fallback.error;
    }
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ id: data.id, createdAt: data.created_at });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
