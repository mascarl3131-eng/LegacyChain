import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAuthenticatedUser } from './_lib/server.js';

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'mascarl3131@gmail.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean),
);

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const user = await getAuthenticatedUser(req);
  const email = user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.has(email)) return res.status(403).json({ error: 'Administrator access required' });

  const enabled = Boolean(req.body?.enabled);
  return res.status(200).json({ ok: true, enabled, administrator: email });
}
