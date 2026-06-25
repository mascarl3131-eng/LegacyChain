type ModerationResult = {
  allowed: boolean;
  action: 'publish' | 'review' | 'reject';
  reason?: string;
};

const DIRECT_PATTERNS: RegExp[] = [
  /\b(kill|murder|terror|terrorist|rape|porn|incest)\b/i,
  /\b(nazi|hitler|kkk|white\s*power|heil)\b/i,
  /\b(suicide|self\s*harm)\b/i,
  /\b(vi[o0]l|p[o0]rn[o0]?|nazi|racis[tm]e?)\b/i,
  /\b(pute|salope|encul[eé]|pd|n[i1]que|viol|porno|suicide|terroriste)\b/i,
];

const OBFUSCATED_PATTERNS: RegExp[] = [
  /k[\W_]*i[\W_]*l[\W_]*l/i,
  /h[\W_]*a[\W_]*t[\W_]*e/i,
  /r[\W_]*a[\W_]*p[\W_]*e/i,
  /p[\W_]*o[\W_]*r[\W_]*n/i,
  /n[\W_]*a[\W_]*z[\W_]*i/i,
  /v[\W_]*i[\W_]*o[\W_]*l/i,
];

const SUSPICIOUS_PATTERNS: RegExp[] = [
  /\b(go back to your country|dirty immigrant|inferior race)\b/i,
  /\b(children|minor|teen|kid)\b.{0,30}\b(sexy|sex|nude|naked)\b/i,
  /\b(sex|nude|naked|onlyfans)\b/i,
  /\b(die|death to|exterminate)\b/i,
  /\b(cr[eè]ve|mort aux|exterminer|sale immigr[eé])\b/i,
];

function normalize(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[0@]/g, 'o')
    .replace(/[1!|]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[4]/g, 'a')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't')
    .toLowerCase();
}

function compact(input: string) {
  return normalize(input).replace(/[^a-z0-9]/g, '');
}

export function moderateText(raw: string): ModerationResult {
  const text = normalize(raw);
  const squeezed = compact(raw);

  if (!text.trim()) return { allowed: false, action: 'reject', reason: 'empty' };
  if (DIRECT_PATTERNS.some(pattern => pattern.test(text)) || OBFUSCATED_PATTERNS.some(pattern => pattern.test(raw))) {
    return { allowed: false, action: 'reject', reason: 'blocked-content' };
  }

  const compactBlocked = ['kill', 'murder', 'terrorist', 'nazi', 'porn', 'rape', 'viol', 'porno'];
  if (compactBlocked.some(term => squeezed.includes(term))) {
    return { allowed: false, action: 'reject', reason: 'obfuscated-content' };
  }

  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(text))) {
    return { allowed: false, action: 'review', reason: 'suspicious-content' };
  }

  return { allowed: true, action: 'publish' };
}
