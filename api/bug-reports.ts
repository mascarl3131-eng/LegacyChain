import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser } from './_lib/server.js';

const CATEGORIES = new Set(['display', 'login', 'payment', 'data', 'performance', 'other']);
const SEVERITIES = new Set(['low', 'medium', 'high', 'blocking']);

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};
  const description = String(body.description || '').trim();
  const category = String(body.category || 'other');
  const severity = String(body.severity || 'medium');
  const contactEmail = String(body.contactEmail || '').trim().slice(0, 254);
  const page = String(body.page || '').trim().slice(0, 100);
  const browser = String(body.browser || '').trim().slice(0, 300);
  const viewport = String(body.viewport || '').trim().slice(0, 40);
  const language = String(body.language || 'en').trim().slice(0, 5);
  const website = String(body.website || '');

  if (website) return res.status(201).json({ ok: true });
  if (description.length < 10 || description.length > 2000) {
    return res.status(400).json({ error: 'Description must contain between 10 and 2000 characters.' });
  }
  if (!CATEGORIES.has(category) || !SEVERITIES.has(severity)) {
    return res.status(400).json({ error: 'Invalid bug report category or severity.' });
  }
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return res.status(400).json({ error: 'Invalid contact email.' });
  }

  const user = await getAuthenticatedUser(req);
  const { error } = await getAdminSupabase().from('bug_reports').insert({
    reporter_id: user?.id || null,
    contact_email: contactEmail || user?.email || null,
    category,
    severity,
    description,
    page,
    browser,
    viewport,
    language,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ ok: true });
}
