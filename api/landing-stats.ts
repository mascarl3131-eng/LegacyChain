import type { ApiRequest, ApiResponse } from './_lib/http.js';
import { getAdminSupabase } from './_lib/server.js';

type CountResult = { count: number | null; error: { message: string } | null };
type CountQuery = PromiseLike<CountResult> & {
  eq(column: string, value: string): CountQuery;
};

async function tableCount(
  table: string,
  applyFilters?: (query: CountQuery) => CountQuery,
) {
  const admin = getAdminSupabase();
  let query = admin.from(table).select('id', { count: 'exact', head: true }) as unknown as CountQuery;
  if (applyFilters) query = applyFilters(query);
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const [families, familyMessages, humanityMessages, capsules] = await Promise.all([
      tableCount('families'),
      tableCount('family_messages'),
      tableCount('humanity_messages', query => query.eq('visibility', 'public').eq('status', 'published')),
      tableCount('family_messages', query => query.eq('message_type', 'capsule')),
    ]);

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    return res.status(200).json({
      families,
      messages: familyMessages + humanityMessages,
      capsules,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load landing stats';
    return res.status(500).json({ error: message });
  }
}
