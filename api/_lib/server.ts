import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { ApiRequest } from './http.js';

export const stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));

export function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing server environment variable: ${name}`);
  return value;
}

export function getBearerToken(req: ApiRequest) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

  const bodyToken = req.body?.accessToken;
  return typeof bodyToken === 'string' && bodyToken.length > 20 ? bodyToken : null;
}

export async function getAuthenticatedUser(req: ApiRequest) {
  const token = getBearerToken(req);
  if (!token) return null;

  const supabase = createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_ANON_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return data.user;
}

export function getAdminSupabase() {
  return createClient(
    requireEnv('SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

export async function grantLifetimePremium(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId || session.payment_status !== 'paid') {
    throw new Error('Checkout session is not a paid LegacyChain purchase.');
  }

  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
  const { error } = await getAdminSupabase()
    .from('premium_entitlements')
    .upsert({
      user_id: userId,
      status: 'active',
      product_code: 'legacychain_lifetime',
      stripe_customer_id: customerId ?? null,
      stripe_checkout_session_id: session.id,
      purchased_at: new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) throw error;
}

export async function revokeLifetimePremium(userId: string, status: 'refunded' | 'revoked') {
  const { error } = await getAdminSupabase()
    .from('premium_entitlements')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
  if (error) throw error;
}

export function getAppOrigin(req: ApiRequest) {
  const configured = process.env.APP_URL?.replace(/\/$/, '');
  if (configured) return configured;

  const origin = req.headers.origin;
  if (origin && /^https?:\/\/[^/]+$/i.test(origin)) return origin;

  throw new Error('APP_URL is not configured.');
}
