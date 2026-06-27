import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';
import { moderateText } from './_lib/moderation.js';

const ALLOWED_EMOTIONS = new Set(['hope', 'love', 'wisdom', 'peace', 'warning', 'memory']);
const ALLOWED_AUDIENCES = new Set(['future', 'descendants', 'humanity', 'whoever']);

function getParams(req: ApiRequest) {
  return new URL(req.url || '/', 'https://thechainlegacy.com').searchParams;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const admin = getAdminSupabase();
  const currentYear = new Date().getFullYear();

  if (req.method === 'GET') {
    const params = getParams(req);
    const page = Math.max(1, Number(params.get('page') || 1));
    const perPage = Math.min(100, Math.max(1, Number(params.get('perPage') || 20)));
    const offset = (page - 1) * perPage;
    const country = params.get('country');
    const emotion = params.get('emotion');
    const audience = params.get('audience');
    const year = Number(params.get('year') || 0);
    const search = params.get('search')?.trim();
    const sort = params.get('sort') === 'oldest' ? 'oldest' : params.get('sort') === 'popular' ? 'popular' : 'newest';

    let query = admin
      .from('humanity_messages')
      .select('id,display_name,show_profile,country,country_code,message,emotion,audience,language,reaction_count,unlock_year,created_at', { count: 'exact' })
      .eq('visibility', 'public')
      .eq('status', 'published')
      .or(`unlock_year.is.null,unlock_year.lte.${currentYear}`);

    if (country) query = query.eq('country', country);
    if (emotion && ALLOWED_EMOTIONS.has(emotion)) query = query.eq('emotion', emotion);
    if (audience && ALLOWED_AUDIENCES.has(audience)) query = query.eq('audience', audience);
    if (year >= 1900 && year <= 2200) {
      query = query.gte('created_at', `${year}-01-01T00:00:00Z`).lt('created_at', `${year + 1}-01-01T00:00:00Z`);
    }
    if (search) query = query.or(`message.ilike.%${search.replaceAll(',', ' ')}%,country.ilike.%${search.replaceAll(',', ' ')}%`);
    if (sort === 'popular') query = query.order('reaction_count', { ascending: false }).order('created_at', { ascending: false });
    else query = query.order('created_at', { ascending: sort === 'oldest' });

    const { data, count, error } = await query.range(offset, offset + perPage - 1);
    if (error) return res.status(500).json({ error: error.message });

    const [{ data: countryRows }, { data: yearRows }] = await Promise.all([
      admin.rpc('humanity_country_counts'),
      admin.rpc('humanity_year_counts'),
    ]);
    const countryCounts = Object.fromEntries((countryRows || []).map(item => [item.country, Number(item.message_count)]));
    const countries = Object.keys(countryCounts);
    const yearCounts = Object.fromEntries((yearRows || []).map(item => [String(item.year), Number(item.message_count)]));
    const years = Object.keys(yearCounts).map(Number);
    return res.status(200).json({ messages: data || [], total: count || 0, page, perPage, countries, years, countryCounts, yearCounts });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const message = String(body.message || '').trim();
    const country = String(body.country || '').trim();
    const countryCode = String(body.countryCode || '').trim().toUpperCase();
    const emotion = String(body.emotion || '');
    const audience = String(body.audience || '');
    const visibility = body.visibility === 'family' ? 'family' : 'public';
    const language = String(body.language || 'en').slice(0, 5);
    const unlockYear = body.unlockYear ? Number(body.unlockYear) : null;
    const user = await getAuthenticatedUser(req);

    if (message.length < 3 || message.length > 500 || !country || !/^[A-Z]{2}$/.test(countryCode) || !ALLOWED_EMOTIONS.has(emotion) || !ALLOWED_AUDIENCES.has(audience) || (unlockYear !== null && (unlockYear < 1900 || unlockYear > 2300))) {
      return res.status(400).json({ error: 'Invalid voice data' });
    }
    const moderation = moderateText(message);
    if (!moderation.allowed) return res.status(422).json({ error: 'Message rejected by safety moderation', reason: moderation.reason });
    if (visibility === 'family' && !user) return res.status(401).json({ error: 'Authentication required for family-only voices' });

    const requestedName = String(body.displayName || '').trim().slice(0, 80);
    const showProfile = Boolean(body.showProfile && user);
    const displayName = showProfile
      ? requestedName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'
      : requestedName || `A voice from ${country}`;

    const { data, error } = await admin
      .from('humanity_messages')
      .insert({
        author_id: user?.id || null,
        display_name: displayName,
        show_profile: showProfile,
        country,
        country_code: countryCode,
        message,
        emotion,
        audience,
        visibility,
        language,
        unlock_year: unlockYear,
        status: 'published',
      })
      .select('id,display_name,show_profile,country,country_code,message,emotion,audience,language,reaction_count,unlock_year,created_at')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ message: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
