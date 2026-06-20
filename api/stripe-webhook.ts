import { grantLifetimePremium, requireEnv, revokeLifetimePremium, stripe } from './_lib/server.js';
import type { ApiRequest, ApiResponse } from './_lib/http.js';

export const config = {
  api: { bodyParser: false },
};

async function readRawBody(req: ApiRequest) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const signature = req.headers['stripe-signature'];
    if (typeof signature !== 'string') return res.status(400).send('Missing Stripe signature');

    const event = stripe.webhooks.constructEvent(
      await readRawBody(req),
      signature,
      requireEnv('STRIPE_WEBHOOK_SECRET'),
    );

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await grantLifetimePremium(event.data.object);
    }
    if (event.type === 'charge.refunded') {
      const charge = event.data.object;
      const paymentIntentId = typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;
      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const userId = paymentIntent.metadata.user_id;
        if (userId) await revokeLifetimePremium(userId, 'refunded');
      }
    }
    if (event.type === 'refund.created') {
      const refund = event.data.object;
      const paymentIntentId = typeof refund.payment_intent === 'string'
        ? refund.payment_intent
        : refund.payment_intent?.id;
      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const userId = paymentIntent.metadata.user_id;
        if (userId) await revokeLifetimePremium(userId, 'refunded');
      }
    }
    if (event.type === 'charge.dispute.created') {
      const dispute = event.data.object;
      const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;
      if (chargeId) {
        const charge = await stripe.charges.retrieve(chargeId);
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const userId = paymentIntent.metadata.user_id;
          if (userId) await revokeLifetimePremium(userId, 'revoked');
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('stripe-webhook:', error);
    return res.status(400).send('Webhook error');
  }
}
