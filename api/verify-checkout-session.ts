import { getAuthenticatedUser, grantLifetimePremium, stripe } from './_lib/server.js';
import type { ApiRequest, ApiResponse } from './_lib/http.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : '';
    if (!sessionId.startsWith('cs_')) return res.status(400).json({ error: 'Invalid session' });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.user_id !== user.id) {
      return res.status(403).json({ error: 'Checkout session does not belong to this user' });
    }
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment is not complete' });
    }

    await grantLifetimePremium(session);
    return res.status(200).json({ premium: true });
  } catch (error) {
    console.error('verify-checkout-session:', error);
    return res.status(500).json({ error: 'Unable to verify checkout session' });
  }
}
