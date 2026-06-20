import { getAppOrigin, getAuthenticatedUser, stripe } from './_lib/server.js';
import type { ApiRequest, ApiResponse } from './_lib/http.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: 'Authentication required' });

    const origin = getAppOrigin(req);
    const amount = Number(process.env.PREMIUM_PRICE_CENTS || 1000);
    const currency = (process.env.PREMIUM_CURRENCY || 'usd').toLowerCase();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: user.id,
      customer_email: user.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name: 'LegacyChain Premium — Lifetime',
            description: 'Lifetime access to LegacyChain Premium features.',
          },
        },
      }],
      metadata: {
        user_id: user.id,
        product_code: 'legacychain_lifetime',
      },
      payment_intent_data: {
        metadata: {
          user_id: user.id,
          product_code: 'legacychain_lifetime',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('create-checkout-session:', error);
    return res.status(500).json({ error: 'Unable to create checkout session' });
  }
}
