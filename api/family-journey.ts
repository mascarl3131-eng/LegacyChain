import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

type CityEntry = { id: string; city: string; country: string; from: string; to: string; note: string };
type CarEntry = { id: string; model: string; from: string; to: string; note: string };
type JourneyItem = { id: string; section: string; title: string; place: string; from: string; to: string; note: string };

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

function sanitizeCities(value: unknown): CityEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 100)
    .map((item, index) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: asText(row.id, 80) || `city-${index + 1}`,
        city: asText(row.city, 120),
        country: asText(row.country, 120),
        from: asText(row.from, 40),
        to: asText(row.to, 40),
        note: asText(row.note, 300),
      };
    })
    .filter(item => item.city || item.country || item.from || item.to || item.note);
}

function sanitizeJourneyItems(value: unknown): JourneyItem[] {
  if (!Array.isArray(value)) return [];
  const allowedSections = new Set(['cities', 'cars', 'schools', 'jobs', 'countries', 'stars', 'traditions', 'music']);
  return value
    .slice(0, 240)
    .map((item, index) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      const section = asText(row.section, 40);
      const title = asText(row.title, 140) || asText(row.city, 120) || asText(row.model, 120);
      const place = asText(row.place, 140) || asText(row.country, 120);
      return {
        id: asText(row.id, 80) || `journey-${index + 1}`,
        section: allowedSections.has(section) ? section : 'cities',
        title,
        place,
        from: asText(row.from, 40),
        to: asText(row.to, 40),
        note: asText(row.note, 300),
      };
    })
    .filter(item => item.title || item.place || item.from || item.to || item.note);
}

function sanitizeCars(value: unknown): CarEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 100)
    .map((item, index) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return {
        id: asText(row.id, 80) || `car-${index + 1}`,
        model: asText(row.model, 120),
        from: asText(row.from, 40),
        to: asText(row.to, 40),
        note: asText(row.note, 300),
      };
    })
    .filter(item => item.model || item.from || item.to || item.note);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const admin = getAdminSupabase();

  if (req.method === 'GET') {
    const familyId = String(params(req).get('familyId') || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const { data, error } = await admin
      .from('family_journeys')
      .select('cities,cars,updated_at')
      .eq('family_id', familyId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({
      cities: sanitizeCities(data?.cities),
      items: sanitizeJourneyItems(data?.cities),
      cars: sanitizeCars(data?.cars),
      updatedAt: data?.updated_at || null,
    });
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const familyId = String(body.familyId || '');
    if (!familyId || !await membership(admin, familyId, user.id)) return res.status(403).json({ error: 'Family access required' });

    const items = sanitizeJourneyItems(body.items || body.cities);
    const cities = items.length ? items : sanitizeCities(body.cities);
    const cars = sanitizeCars(body.cars);

    const { error } = await admin
      .from('family_journeys')
      .upsert({
        family_id: familyId,
        cities,
        cars,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'family_id' });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
