import { createHash, randomBytes } from 'node:crypto';
import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase, getAuthenticatedUser, getAppOrigin } from './_lib/server.js';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const user = await getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: 'Authentication required' });
  const admin = getAdminSupabase();

  if (req.method === 'GET') {
    const { data, error } = await admin
      .from('family_members')
      .select('role,family:families(id,name,owner_id,created_at)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ families: data || [] });
  }

  if (req.method === 'POST') {
    const action = String(req.body?.action || 'create');

    if (action === 'create') {
      const name = String(req.body?.name || '').trim().slice(0, 100);
      if (!name) return res.status(400).json({ error: 'Family name required' });
      const { data: family, error } = await admin.from('families').insert({ name, owner_id: user.id }).select('id,name,owner_id,created_at').single();
      if (error) return res.status(500).json({ error: error.message });
      const { error: memberError } = await admin.from('family_members').insert({ family_id: family.id, user_id: user.id, role: 'owner' });
      if (memberError) {
        await admin.from('families').delete().eq('id', family.id);
        return res.status(500).json({ error: memberError.message });
      }
      return res.status(201).json({ family, role: 'owner' });
    }

    if (action === 'invite') {
      const familyId = String(req.body?.familyId || '');
      const role = ['admin', 'member', 'child'].includes(String(req.body?.role)) ? String(req.body?.role) : 'member';
      const invitedEmail = String(req.body?.email || '').trim().toLowerCase().slice(0, 254) || null;
      const { data: membership } = await admin.from('family_members').select('role').eq('family_id', familyId).eq('user_id', user.id).maybeSingle();
      if (!membership || !['owner', 'admin'].includes(membership.role)) return res.status(403).json({ error: 'Family administrator access required' });

      const token = randomBytes(32).toString('base64url');
      const { error } = await admin.from('family_invitations').insert({
        family_id: familyId,
        created_by: user.id,
        token_hash: hashToken(token),
        invited_email: invitedEmail,
        role,
      });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ inviteUrl: `${getAppOrigin(req)}/?familyInvite=${token}`, expiresInDays: 7 });
    }

    if (action === 'accept') {
      const token = String(req.body?.token || '');
      if (token.length < 20) return res.status(400).json({ error: 'Invalid invitation' });
      const { data: invitation } = await admin.from('family_invitations').select('id,family_id,invited_email,role,expires_at,accepted_at').eq('token_hash', hashToken(token)).maybeSingle();
      if (!invitation || invitation.accepted_at || new Date(invitation.expires_at) <= new Date()) return res.status(410).json({ error: 'Invitation expired or already used' });
      if (invitation.invited_email && invitation.invited_email !== user.email?.toLowerCase()) return res.status(403).json({ error: 'This invitation belongs to another email address' });

      const { error: memberError } = await admin.from('family_members').upsert({ family_id: invitation.family_id, user_id: user.id, role: invitation.role }, { onConflict: 'family_id,user_id' });
      if (memberError) return res.status(500).json({ error: memberError.message });
      await admin.from('family_invitations').update({ accepted_by: user.id, accepted_at: new Date().toISOString() }).eq('id', invitation.id);
      return res.status(200).json({ ok: true, familyId: invitation.family_id });
    }

    return res.status(400).json({ error: 'Unknown family action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
