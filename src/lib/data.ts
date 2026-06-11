import type { LangCode } from './i18n';

export interface Message {
  id: string;
  a: string;
  y: number;
  text: string;
  e: 'hope' | 'love' | 'wisdom' | 'memory' | 'warning';
  type: 'standard' | 'birth' | 'capsule';
  lock: number | null;
  baby?: string | null;
  dy?: number | null;
  audioUrl?: string | null;
  photo?: string | null;
}

export interface HumanityMessage {
  id: string;
  a: string;
  c: string;
  f: string;
  text: string;
  e: 'hope' | 'love' | 'wisdom' | 'memory' | 'warning' | 'peace';
  y: number;
  likes: number;
}

export interface Challenge {
  id: string;
  q: string;
  ans: { a: string; y: number; text: string }[];
}

export interface TreeNode {
  id: number;
  n: string;
  b: number;
  x: number;
  y: number;
  gen: number;
}

export interface OriginRow {
  c: string;
  p: number;
}

export interface BookField {
  l: string;
  p: string;
}

export interface BookChapter {
  t: string;
  s: string;
  fields: BookField[];
}

export const BANNED_WORDS = ['hate', 'kill', 'murder', 'racist', 'fuck', 'shit', 'bitch', 'terrorist'];

export const FLAGS: Record<string, string> = {
  Australia: '🇦🇺', France: '🇫🇷', Japan: '🇯🇵', USA: '🇺🇸', Brazil: '🇧🇷',
  Nigeria: '🇳🇬', India: '🇮🇳', Canada: '🇨🇦', Ukraine: '🇺🇦', China: '🇨🇳',
  Argentina: '🇦🇷', Senegal: '🇸🇳', Germany: '🇩🇪', Spain: '🇪🇸', Italy: '🇮🇹',
  Mexico: '🇲🇽', 'United Kingdom': '🇬🇧', Russia: '🇷🇺', Kenya: '🇰🇪',
  'Saudi Arabia': '🇸🇦', 'South Korea': '🇰🇷', Netherlands: '🇳🇱', Sweden: '🇸🇪',
  Portugal: '🇵🇹', Turkey: '🇹🇷', Egypt: '🇪🇬', Pakistan: '🇵🇰', Indonesia: '🇮🇩',
};

export const CHART_COLORS = ['#00FFD1', '#C084FC', '#FFB347', '#FF6B9D', '#7DD3FC', '#86EFAC'];

export const TICKER_MSGS = [
  { f: '🇸🇳', t: 'Senegal · 2025 — "I hope you have solved hunger."' },
  { f: '🇯🇵', t: 'Japan · 2025 — "My daughter was just born. Take care of her."' },
  { f: '🇺🇦', t: 'Ukraine · 2025 — "We were in a war. I hope you no longer know this."' },
  { f: '🇧🇷', t: 'Brazil · 2025 — "The forest I loved is disappearing."' },
  { f: '🇦🇺', t: 'Australia · 2025 — "The oceans were rising. How are they now?"' },
  { f: '🇳🇬', t: 'Nigeria · 2025 — "I am young, scared, and hopeful. Both at once."' },
  { f: '🇨🇦', t: 'Canada · 2025 — "Does love still exist where you are?"' },
  { f: '🇮🇳', t: 'India · 2025 — "We were 8 billion. How many are you now?"' },
  { f: '🇫🇷', t: 'France · 2025 — "We were afraid of the future. Did you find peace?"' },
  { f: '🇩🇪', t: 'Germany · 2025 — "We tried to remember our history. Do not forget yours."' },
];

export const COORD_MAP: Record<string, [number, number]> = {
  France: [46, 2], Senegal: [14, -14], Vietnam: [16, 108], Japan: [36, 138],
  Brazil: [-15, -47], Nigeria: [9, 8], China: [35, 105], India: [20, 77],
  'United Kingdom': [55, -3], Germany: [51, 10], Italy: [42, 12], Spain: [40, -4],
  Australia: [-25, 133], Canada: [56, -106], Russia: [61, 105], Ukraine: [49, 32],
  Mexico: [24, -102], Argentina: [-34, -64], USA: [38, -97], Kenya: [-1, 38],
  'South Korea': [36, 128], Netherlands: [52, 5], Sweden: [60, 18], Portugal: [39, -8],
  Turkey: [39, 35], Egypt: [26, 30], Pakistan: [30, 69], Indonesia: [-2, 118],
};

export function getDemoMsgs(lang: LangCode): Message[] {
  const data: Record<LangCode, Message[]> = {
    en: [
      { id: '1', a: 'Marie', y: 1987, text: "To whoever reads this: I planted an oak tree the day you were born. I hope it is still standing.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Robert', y: 2001, text: "When the towers fell, I held your grandmother's hand and thought of all of you, unborn. Did we build the world you deserved?", e: 'memory', type: 'standard', lock: null },
      { id: '3', a: 'Jean', y: 2024, text: "To Lucas, my firstborn. Love is not something you feel — it is something you do, every single day.", e: 'love', type: 'birth', lock: null, baby: 'Lucas', dy: 2042 },
      { id: '4', a: 'Sophie', y: 2024, text: "Sealed for our 50th reunion. If you read this in 2074 — the family is still here.", e: 'wisdom', type: 'standard', lock: 2074 },
    ],
    fr: [
      { id: '1', a: 'Marie', y: 1987, text: "À qui lira ceci : j'ai planté un chêne le jour de ta naissance. J'espère qu'il est encore debout.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Robert', y: 2001, text: "Quand les tours sont tombées, j'ai tenu la main de ta grand-mère. Avons-nous construit le monde que vous méritiez ?", e: 'memory', type: 'standard', lock: null },
      { id: '3', a: 'Jean', y: 2024, text: "À Lucas, mon premier enfant. L'amour n'est pas quelque chose qu'on ressent — c'est quelque chose qu'on fait.", e: 'love', type: 'birth', lock: null, baby: 'Lucas', dy: 2042 },
      { id: '4', a: 'Sophie', y: 2024, text: "Scellé pour notre 50e réunion. Si tu lis ceci en 2074 — la famille est encore là.", e: 'wisdom', type: 'standard', lock: 2074 },
    ],
    es: [
      { id: '1', a: 'María', y: 1987, text: "A quien lea esto: planté un roble el día de tu nacimiento. Espero que siga en pie.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Roberto', y: 2001, text: "Cuando cayeron las torres, tomé la mano de tu abuela y pensé en todos vosotros, aún no nacidos.", e: 'memory', type: 'standard', lock: null },
      { id: '3', a: 'Juan', y: 2024, text: "Para Lucas, mi primogénito. El amor no es algo que sientes, es algo que haces cada día.", e: 'love', type: 'birth', lock: null, baby: 'Lucas', dy: 2042 },
    ],
    pt: [
      { id: '1', a: 'Maria', y: 1987, text: "A quem ler isto: plantei um carvalho no dia do teu nascimento. Espero que ainda esteja de pé.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Roberto', y: 2001, text: "Quando as torres caíram, segurei a mão da tua avó e pensei em todos vocês, ainda não nascidos.", e: 'memory', type: 'standard', lock: null },
    ],
    de: [
      { id: '1', a: 'Marie', y: 1987, text: "An den, der das liest: Ich habe am Tag deiner Geburt eine Eiche gepflanzt. Ich hoffe, sie steht noch.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Robert', y: 2001, text: "Als die Türme fielen, hielt ich die Hand deiner Großmutter und dachte an euch alle, ungeboren.", e: 'memory', type: 'standard', lock: null },
    ],
    it: [
      { id: '1', a: 'Maria', y: 1987, text: "A chi leggerà questo: ho piantato una quercia il giorno della tua nascita. Spero sia ancora lì.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Roberto', y: 2001, text: "Quando le torri caddero, tenni la mano di tua nonna e pensai a tutti voi, non ancora nati.", e: 'memory', type: 'standard', lock: null },
    ],
    ar: [
      { id: '1', a: 'مريم', y: 1987, text: "لمن يقرأ هذا: غرست بلوطاً يوم ولادتك. أمل أنه لا يزال قائماً.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'روبرت', y: 2001, text: "عندما سقطت الأبراج، أمسكت يد جدتك وفكرت بكم جميعاً، ولم تولدوا بعد.", e: 'memory', type: 'standard', lock: null },
    ],
    zh: [
      { id: '1', a: '玛丽', y: 1987, text: "致读到这段文字的人：你出生的那天我种下了一棵橡树。希望它还在那里。", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: '罗伯特', y: 2001, text: "当双塔倒塌时，我握着你的祖母的手，想着你们所有人，还未出生的你们。", e: 'memory', type: 'standard', lock: null },
    ],
    ja: [
      { id: '1', a: 'マリー', y: 1987, text: "これを読む人へ：あなたが生まれた日に、私は楢の木を植えました。まだそこにあることを願います。", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'ロバート', y: 2001, text: "塔が倒れた時、私はあなたの祖母の手を握り、まだ生まれていないあなたたちのことを考えました。", e: 'memory', type: 'standard', lock: null },
    ],
    ko: [
      { id: '1', a: '마리', y: 1987, text: "이 글을 읽는 이에게: 당신이 태어난 날 나는 참나무를 심었습니다. 아직 서 있기를 바랍니다.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: '로버트', y: 2001, text: "탑이 물러질 때, 나는 당신의 할머니의 손을 잡고 아직 태어나지 않은 당신들 모두를 생각했습니다.", e: 'memory', type: 'standard', lock: null },
    ],
    ru: [
      { id: '1', a: 'Мария', y: 1987, text: "Тому, кто это читает: я посадила дуб в день твоего рождения. Надеюсь, он всё ещё стоит.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Роберт', y: 2001, text: "Когда башни упали, я держала руку твоей бабушки и думала о вас всех, нерождённых.", e: 'memory', type: 'standard', lock: null },
    ],
    hi: [
      { id: '1', a: 'मेरी', y: 1987, text: "जो भी यह पढ़े: मैंने तुम्हारे जन्म के दिन एक बांज का पेड़ लगाया था। उम्मीद है वो अब भी खड़ा हो।", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'रॉबर्ट', y: 2001, text: "जब टावर गिरे, मैंने तुम्हारी दादी का हाथ पकड़ा और तुम सबके बारे में सोचा, अजन्मे।", e: 'memory', type: 'standard', lock: null },
    ],
    sw: [
      { id: '1', a: 'Maria', y: 1987, text: "Kwa yeyote atakayesoma hii: Nilipanda mti wa mwaloni siku uliyozaliwa. Natumaini bado umesimama.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Robert', y: 2001, text: "Whengu mnara ulianguka, nilishika mkono wa bibi yako na kufikiria nyinyi nyote, ambao hamjazaliwa.", e: 'memory', type: 'standard', lock: null },
    ],
    nl: [
      { id: '1', a: 'Marie', y: 1987, text: "Aan wie dit leest: ik heb een eik geplant op de dag dat jij geboren bent. Ik hoop dat hij er nog staat.", e: 'hope', type: 'standard', lock: null },
      { id: '2', a: 'Robert', y: 2001, text: "Toen de torens vielen, hield ik de hand van je grootmoeder vast en dacht aan jullie allen, ongeboren.", e: 'memory', type: 'standard', lock: null },
    ],
  };
  return data[lang] || data.en;
}

export function getDemoHumanity(lang: LangCode): HumanityMessage[] {
  const data: Record<LangCode, HumanityMessage[]> = {
    en: [
      { id: '1', a: 'A voice from Senegal', c: 'Senegal', f: '🇸🇳', text: "I live in a world where we still fight for food. I hope you have solved that.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'A voice from Japan', c: 'Japan', f: '🇯🇵', text: "My daughter was just born. I entrust her to you. Take care of her.", e: 'love', y: 2025, likes: 89 },
      { id: '3', a: 'A voice from Ukraine', c: 'Ukraine', f: '🇺🇦', text: "We were crossing a war. I hope you no longer know this.", e: 'hope', y: 2025, likes: 134 },
      { id: '4', a: 'A voice from Brazil', c: 'Brazil', f: '🇧🇷', text: "The forest I loved as a child is disappearing. I hope you kept it.", e: 'warning', y: 2025, likes: 62 },
      { id: '5', a: 'A voice from Australia', c: 'Australia', f: '🇦🇺', text: "The oceans were rising slowly. How are they where you are?", e: 'wisdom', y: 2025, likes: 31 },
      { id: '6', a: 'A voice from Nigeria', c: 'Nigeria', f: '🇳🇬', text: "I am young, scared and hopeful. Both at once. You understand?", e: 'hope', y: 2025, likes: 78 },
    ],
    fr: [
      { id: '1', a: 'Une voix du Sénégal', c: 'Sénégal', f: '🇸🇳', text: "Je vis dans un monde où l'on se bat encore pour manger. J'espère que vous avez résolu ça.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Une voix du Japon', c: 'Japon', f: '🇯🇵', text: "Ma fille vient de naître. Je vous la confie. Prenez soin d'elle.", e: 'love', y: 2025, likes: 89 },
      { id: '3', a: "Une voix d'Ukraine", c: 'Ukraine', f: '🇺🇦', text: "Nous traversions une guerre. J'espère que vous ne connaissez plus ça.", e: 'hope', y: 2025, likes: 134 },
      { id: '4', a: 'Une voix du Brésil', c: 'Brésil', f: '🇧🇷', text: "La forêt que j'aimais enfant disparaît. J'espère que vous avez su la garder.", e: 'warning', y: 2025, likes: 62 },
      { id: '5', a: "Une voix d'Australie", c: 'Australie', f: '🇦🇺', text: "Les océans montaient. Comment sont-ils chez vous ?", e: 'wisdom', y: 2025, likes: 31 },
      { id: '6', a: 'Une voix du Nigeria', c: 'Nigeria', f: '🇳🇬', text: "Je suis jeune, j'ai peur et j'espère. Les deux à la fois.", e: 'hope', y: 2025, likes: 78 },
    ],
    es: [
      { id: '1', a: 'Una voz de Senegal', c: 'Senegal', f: '🇸🇳', text: "Vivo en un mundo donde todavía luchamos por comer. Espero que lo hayan resuelto.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Una voz de Japón', c: 'Japón', f: '🇯🇵', text: "Mi hija acaba de nacer. Se la confío a ustedes. Cuídenla.", e: 'love', y: 2025, likes: 89 },
    ],
    pt: [
      { id: '1', a: 'Uma voz do Senegal', c: 'Senegal', f: '🇸🇳', text: "Vivo num mundo onde ainda lutamos por comida. Espero que vocês tenham resolvido isso.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Uma voz do Japão', c: 'Japão', f: '🇯🇵', text: "Minha filha acabou de nascer. Eu a confio a vocês. Cuidem bem dela.", e: 'love', y: 2025, likes: 89 },
    ],
    de: [
      { id: '1', a: 'Eine Stimme aus Senegal', c: 'Senegal', f: '🇸🇳', text: "Ich lebe in einer Welt, in der wir immer noch um Nahrung kämpfen. Ich hoffe, ihr habt das gelöst.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Eine Stimme aus Japan', c: 'Japan', f: '🇯🇵', text: "Meine Tochter ist gerade geboren. Ich vertraue sie euch an. Passt auf sie auf.", e: 'love', y: 2025, likes: 89 },
    ],
    it: [
      { id: '1', a: 'Una voce dal Senegal', c: 'Senegal', f: '🇸🇳', text: "Vivo in un mondo dove lottiamo ancora per il cibo. Spero che voi abbiate risolto questo.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Una voce dal Giappone', c: 'Giappone', f: '🇯🇵', text: "Mia figlia è appena nata. Vi affido lei. Abbiate cura di lei.", e: 'love', y: 2025, likes: 89 },
    ],
    ar: [
      { id: '1', a: 'صوت من السنغال', c: 'السنغال', f: '🇸🇳', text: "أعيش في عالم لا نزال نكافح فيه من أجل الطعام. أمل أنكم حللتم ذلك.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'صوت من اليابان', c: 'اليابان', f: '🇯🇵', text: "ابنتي ولدت للتو. أؤمنها لكم.اعتنوا بها.", e: 'love', y: 2025, likes: 89 },
    ],
    zh: [
      { id: '1', a: '来自塞内加尔的声音', c: '塞内加尔', f: '🇸🇳', text: "我生活在一个我们仍然为食物而战的世界。我希望你们已经解决了这个问题。", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: '来自日本的声音', c: '日本', f: '🇯🇵', text: "我的女儿刚刚出生。我把她托付给你们。请好好照顾她。", e: 'love', y: 2025, likes: 89 },
    ],
    ja: [
      { id: '1', a: 'セネガルの声', c: 'セネガル', f: '🇸🇳', text: "私たちはまだ食料のために戦う世界に生きています。あなた方がそれを解決していることを願います。", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: '日本の声', c: '日本', f: '🇯🇵', text: "娘が生まれました。彼女をあなた方に託します。どうか大切にしてください。", e: 'love', y: 2025, likes: 89 },
    ],
    ko: [
      { id: '1', a: '세네갈의 목소리', c: '세네갈', f: '🇸🇳', text: "우리는 여전히 식량을 위해 싸우는 세상에 살고 있습니다. 여러분이 그것을 해결했기를 바랍니다.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: '일본의 목소리', c: '일본', f: '🇯🇵', text: "내 딸이 방금 태어났습니다. 그녀를 여러분에게 맡깁니다. 잘 부탁드립니다.", e: 'love', y: 2025, likes: 89 },
    ],
    ru: [
      { id: '1', a: 'Голос из Сенегала', c: 'Сенегал', f: '🇸🇳', text: "Я живу в мире, где мы всё ещё боремся за еду. Надеюсь, вы решили эту проблему.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Голос из Японии', c: 'Япония', f: '🇯🇵', text: "Моя дочь только что родилась. Я доверяю её вам. Позаботьтесь о ней.", e: 'love', y: 2025, likes: 89 },
    ],
    hi: [
      { id: '1', a: 'सेनेजल से एक आवाज़', c: 'सेनेजल', f: '🇸🇳', text: "मैं एक ऐसी दुनिया में रहता हूँ जहाँ हम अभी भी खाने के लिए लड़ते हैं। आशा है कि आपने इसे हल कर लिया होगा।", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'जापान से एक आवाज़', c: 'जापान', f: '🇯🇵', text: "मेरी बेटी अभी जन्मी है। मैं उसे आपके सुपुर्द करता हूँ। उसका खयाल रखना।", e: 'love', y: 2025, likes: 89 },
    ],
    sw: [
      { id: '1', a: 'Sauti kutoka Senegal', c: 'Senegal', f: '🇸🇳', text: "Naishi katika ulimwengu ambapo bado tunapigania chakula. Natumaini mmeisuluhisha hiyo.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Sauti kutoka Japani', c: 'Japani', f: '🇯🇵', text: "Binti yangu amezaliwa tu. Namkabidhi kwenu. Mwangalie vizuri.", e: 'love', y: 2025, likes: 89 },
    ],
    nl: [
      { id: '1', a: 'Een stem uit Senegal', c: 'Senegal', f: '🇸🇳', text: "Ik leef in een wereld waar we nog steeds vechten voor voedsel. Ik hoop dat jullie dat hebben opgelost.", e: 'hope', y: 2025, likes: 47 },
      { id: '2', a: 'Een stem uit Japan', c: 'Japan', f: '🇯🇵', text: "Mijn dochter is net geboren. Ik vertrouw haar aan jullie toe. Zorg goed voor haar.", e: 'love', y: 2025, likes: 89 },
    ],
  };
  return data[lang] || data.en;
}

export function getBookChs(lang: LangCode): BookChapter[] {
  const data: Record<LangCode, BookChapter[]> = {
    en: [
      { t: 'WHO I AM', s: 'Your origins, childhood, what built you', fields: [{ l: 'Date and place of birth', p: '15 March 1985, Paris...' }, { l: 'My childhood in a few words', p: 'A summer that lasted forever...' }, { l: 'What built me', p: 'The day I realized...' }] },
      { t: 'MY VALUES', s: 'What you believe, what guides you', fields: [{ l: 'My 3 most important values', p: 'Honesty, courage, kindness...' }, { l: 'What I believe deeply', p: 'I believe that every human...' }, { l: 'What I regret', p: 'Not having said I love you more...' }] },
      { t: 'MY LIFE ADVICE', s: 'Wisdom for those who follow', fields: [{ l: 'To my children', p: 'Never stop learning...' }, { l: 'To my grandchildren', p: 'The world you inherit...' }, { l: 'To generations I will never see', p: 'By the time you read this...' }] },
      { t: 'MY TREASURES', s: 'What you love, what changed you', fields: [{ l: 'My favourite recipe', p: "My grandmother's tart..." }, { l: 'The song that defines me', p: 'Because the first time I heard it...' }, { l: 'The book that changed me', p: 'It made me see differently...' }, { l: 'The place where I feel at home', p: 'There is a bench by the river...' }] },
      { t: 'PERSONAL LETTERS', s: 'Words meant only for them', fields: [{ l: 'A letter to someone you love', p: 'Dear one, there are things I never said...' }, { l: 'A letter to a future generation', p: 'You will never know me, but...' }] },
      { t: 'MY LEGACY', s: 'What you leave behind', fields: [{ l: 'What I am most proud of', p: 'That I kept my word...' }, { l: 'What I would like to be remembered for', p: 'Someone who showed up...' }, { l: 'My last words', p: 'If you are reading this, know that I lived.' }] },
    ],
    fr: [
      { t: 'QUI JE SUIS', s: 'Vos origines, votre enfance, ce qui vous a construit', fields: [{ l: 'Date et lieu de naissance', p: '15 mars 1985, Paris...' }, { l: 'Mon enfance en quelques mots', p: 'Un été qui a duré pour toujours...' }, { l: 'Ce qui m\'a construit(e)', p: 'Le jour où j\'ai réalisé...' }] },
      { t: 'MES VALEURS', s: 'Ce en quoi vous croyez', fields: [{ l: 'Mes 3 valeurs les plus importantes', p: 'Honnêteté, courage, bienveillance...' }, { l: 'Ce en quoi je crois profondément', p: 'Je crois que chaque être humain...' }, { l: 'Ce que je regrette', p: 'Ne pas avoir dit je t\'aime plus souvent...' }] },
      { t: 'MES CONSEILS DE VIE', s: 'La sagesse pour ceux qui suivent', fields: [{ l: 'À mes enfants', p: 'N\'arrêtez jamais d\'apprendre...' }, { l: 'À mes petits-enfants', p: 'Le monde que vous héritez...' }, { l: 'Aux générations que je ne verrai jamais', p: 'Au moment où vous lirez ceci...' }] },
      { t: 'MES TRÉSORS', s: 'Ce que vous aimez', fields: [{ l: 'Ma recette préférée', p: 'La tarte de ma grand-mère...' }, { l: 'La chanson qui me définit', p: 'Parce que la première fois...' }, { l: 'Le livre qui m\'a changé(e)', p: 'Il m\'a fait voir le monde différemment...' }, { l: 'L\'endroit où je me sens chez moi', p: 'Il y a un banc au bord de la rivière...' }] },
      { t: 'LETTRES PERSONNELLES', s: 'Des mots destinés uniquement à eux', fields: [{ l: 'Une lettre à quelqu\'un que vous aimez', p: 'Cher(e), il y a des choses que je n\'ai jamais dites...' }, { l: 'Une lettre à une génération future', p: 'Vous ne me connaîtrez jamais, mais...' }] },
      { t: 'MON HÉRITAGE', s: 'Ce que vous laissez derrière vous', fields: [{ l: 'Ce dont je suis le plus fier/fière', p: 'D\'avoir tenu ma parole...' }, { l: 'Ce dont je voudrais qu\'on se souvienne', p: 'Quelqu\'un qui était là...' }, { l: 'Mes derniers mots', p: 'Si vous lisez ceci, sachez que j\'ai vécu.' }] },
    ],
    es: [
      { t: 'QUIÉN SOY', s: 'Tus orígenes, tu infancia, lo que te construyó', fields: [{ l: 'Fecha y lugar de nacimiento', p: '15 de marzo de 1985, París...' }, { l: 'Mi infancia en pocas palabras', p: 'Un verano que duró para siempre...' }, { l: 'Lo que me construyó', p: 'El día en que me di cuenta...' }] },
      { t: 'MIS VALORES', s: 'En qué crees, qué te guía', fields: [{ l: 'Mis 3 valores más importantes', p: 'Honestidad, coraje, bondad...' }, { l: 'En lo que creo profundamente', p: 'Creo que cada ser humano...' }, { l: 'Lo que lamento', p: 'No haber dicho te quiero más...' }] },
      { t: 'MIS CONSEJOS DE VIDA', s: 'Sabiduría para quienes siguen', fields: [{ l: 'A mis hijos', p: 'Nunca dejen de aprender...' }, { l: 'A mis nietos', p: 'El mundo que heredan...' }, { l: 'A generaciones que nunca veré', p: 'Para cuando lean esto...' }] },
      { t: 'MIS TESOROS', s: 'Lo que amas, lo que te cambió', fields: [{ l: 'Mi receta favorita', p: 'La tarta de mi abuela...' }, { l: 'La canción que me define', p: 'Porque la primera vez que la escuché...' }, { l: 'El libro que me cambió', p: 'Me hizo ver el mundo diferente...' }, { l: 'El lugar donde me siento en casa', p: 'Hay un banco junto al río...' }] },
      { t: 'CARTAS PERSONALES', s: 'Palabras destinadas solo a ellos', fields: [{ l: 'Una carta a alguien que amas', p: 'Querido(a), hay cosas que nunca dije...' }, { l: 'Una carta a una generación futura', p: 'Nunca me conocerán, pero...' }] },
      { t: 'MI LEGADO', s: 'Lo que dejas atrás', fields: [{ l: 'De lo que estoy más orgulloso', p: 'De haber cumplido mi palabra...' }, { l: 'Por lo que me gustaría ser recordado', p: 'Alguien que estuvo ahí...' }, { l: 'Mis últimas palabras', p: 'Si están leyendo esto, sepan que viví.' }] },
    ],
    pt: [
      { t: 'QUEM SOU', s: 'Suas origens, sua infância, o que te construiu', fields: [{ l: 'Data e local de nascimento', p: '15 de março de 1985, Paris...' }, { l: 'Minha infância em poucas palavras', p: 'Um verão que durou para sempre...' }, { l: 'O que me construiu', p: 'O dia em que percebi...' }] },
      { t: 'MEUS VALORES', s: 'No que você acredita, o que te guia', fields: [{ l: 'Meus 3 valores mais importantes', p: 'Honestidade, coragem, bondade...' }, { l: 'No que acredito profundamente', p: 'Acredito que cada ser humano...' }, { l: 'Do que me arrependo', p: 'Não ter dito eu te amo mais...' }] },
      { t: 'MEUS CONSELHOS DE VIDA', s: 'Sabedoria para quem segue', fields: [{ l: 'Para meus filhos', p: 'Nunca parem de aprender...' }, { l: 'Para meus netos', p: 'O mundo que vocês herdam...' }, { l: 'Para gerações que nunca verei', p: 'Quando vocês lerem isto...' }] },
      { t: 'MEUS TESOUROS', s: 'O que você ama, o que te mudou', fields: [{ l: 'Minha receita favorita', p: 'A tarte da minha avó...' }, { l: 'A música que me define', p: 'Porque a primeira vez que ouvi...' }, { l: 'O livro que me mudou', p: 'Fez-me ver o mundo diferente...' }, { l: 'O lugar onde me sinto em casa', p: 'Há um banco junto ao rio...' }] },
      { t: 'CARTAS PESSOAIS', s: 'Palavras destinadas apenas a eles', fields: [{ l: 'Uma carta para alguém que amas', p: 'Querido(a), há coisas que nunca disse...' }, { l: 'Uma carta para uma geração futura', p: 'Nunca me conhecerão, mas...' }] },
      { t: 'MEU LEGADO', s: 'O que você deixa para trás', fields: [{ l: 'Do que tenho mais orgulho', p: 'De ter cumprido minha palavra...' }, { l: 'Pel o que gostaria de ser lembrado', p: 'Alguém que esteve presente...' }, { l: 'Minhas últimas palavras', p: 'Se estão lendo isto, saibam que vivi.' }] },
    ],
    de: [
      { t: 'WER ICH BIN', s: 'Deine Ursprünge, Kindheit, was dich aufbaute', fields: [{ l: 'Geburtsdatum und -ort', p: '15. März 1985, Paris...' }, { l: 'Meine Kindheit in wenigen Worten', p: 'Ein Sommer, der ewig währte...' }, { l: 'Was mich aufbaute', p: 'Als ich erkannte...' }] },
      { t: 'MEINE WERTE', s: 'Worin du glaubst, was dich leitet', fields: [{ l: 'Meine 3 wichtigsten Werte', p: 'Ehrlichkeit, Mut, Freundlichkeit...' }, { l: 'Worin ich tief glaube', p: 'Ich glaube, dass jeder Mensch...' }, { l: 'Was ich bereue', p: 'Nicht öfter gesagt zu haben, dass ich dich liebe...' }] },
      { t: 'MEINE LEBENSRATSCHLÄGE', s: 'Weisheit für die, die folgen', fields: [{ l: 'An meine Kinder', p: 'Hört niemals auf zu lernen...' }, { l: 'An meine Enkelkinder', p: 'Die Welt, die ihr erbt...' }, { l: 'An Generationen, die ich nie sehen werde', p: 'Wenn ihr das lest...' }] },
      { t: 'MEINE SCHÄTZE', s: 'Was du liebst, was dich veränderte', fields: [{ l: 'Mein Lieblingsrezept', p: 'Die Tarte meiner Großmutter...' }, { l: 'Das Lied, das mich definiert', p: 'Weil ich es das erste Mal hörte...' }, { l: 'Das Buch, das mich veränderte', p: 'Es ließ mich anders sehen...' }, { l: 'Der Ort, an dem ich mich zuhause fühle', p: 'Da ist eine Bank am Fluss...' }] },
      { t: 'PERSÖNLICHE BRIEFE', s: 'Worte nur für sie bestimmt', fields: [{ l: 'Ein Brief an jemanden, den du liebst', p: 'Liebe/r, es gibt Dinge, die ich nie sagte...' }, { l: 'Ein Brief an eine zukünftige Generation', p: 'Ihr werdet mich nie kennen, aber...' }] },
      { t: 'MEIN VERMÄCHTNIS', s: 'Was du hinterlässt', fields: [{ l: 'Worauf ich am meisten stolz bin', p: 'Dass ich mein Wort gehalten habe...' }, { l: 'Wofür ich mich gerne erinnert wissen möchte', p: 'Als jemand, der da war...' }, { l: 'Meine letzten Worte', p: 'Wenn ihr das lest, wisst, dass ich gelebt habe.' }] },
    ],
    it: [
      { t: 'CHI SONO', s: 'Le tue origini, infanzia, ciò che ti ha costruito', fields: [{ l: 'Data e luogo di nascita', p: '15 marzo 1985, Parigi...' }, { l: 'La mia infanzia in poche parole', p: 'Un\'estate che durò per sempre...' }, { l: 'Ciò che mi ha costruito', p: 'Il giorno in cui capii...' }] },
      { t: 'I MIEI VALORI', s: 'In cosa credi, ciò che ti guida', fields: [{ l: 'I miei 3 valori più importanti', p: 'Onestà, coraggio, gentilezza...' }, { l: 'In cosa credo profondamente', p: 'Credo che ogni essere umano...' }, { l: 'Cosa rimpiango', p: 'Non aver detto ti amo più spesso...' }] },
      { t: 'I MIEI CONSIGLI DI VITA', s: 'Saggezza per chi segue', fields: [{ l: 'Ai miei figli', p: 'Non smettete mai di imparare...' }, { l: 'Ai miei nipoti', p: 'Il mondo che ereditate...' }, { l: 'A generazioni che non vedrò mai', p: 'Quando leggerete questo...' }] },
      { t: 'I MIEI TESORI', s: 'Ciò che ami, ciò che ti ha cambiato', fields: [{ l: 'La mia ricetta preferita', p: 'La crostata di mia nonna...' }, { l: 'La canzone che mi definisce', p: 'Perché la prima volta che l\'ho sentita...' }, { l: 'Il libro che mi ha cambiato', p: 'Mi ha fatto vedere il mondo diversamente...' }, { l: 'Il luogo in cui mi sento a casa', p: 'C\'è una panchina vicino al fiume...' }] },
      { t: 'LETTERE PERSONALI', s: 'Parole destinate solo a loro', fields: [{ l: 'Una lettera a qualcuno che ami', p: 'Caro/a, ci sono cose che non ho mai detto...' }, { l: 'Una lettera a una generazione futura', p: 'Non mi conoscerete mai, ma...' }] },
      { t: 'IL MIO LASCITO', s: 'Ciò che lasci dietro di te', fields: [{ l: 'Di cosa vado più fiero', p: 'Di aver mantenuto la mia parola...' }, { l: 'Per cosa vorrei essere ricordato', p: 'Qualcuno che c\'era...' }, { l: 'Le mie ultime parole', p: 'Se state leggendo questo, sappiate che ho vissuto.' }] },
    ],
    ar: [
      { t: 'من أنا', s: 'أصولك، طفولتك، ما بنى شخصيتك', fields: [{ l: 'تاريخ ومكان الولادة', p: '15 مارس 1985، باريس...' }, { l: 'طفولتي بكلمات قليلة', p: 'صيف دام للأبد...' }, { l: 'ما بناني', p: 'في اليوم الذي أدركت فيه...' }] },
      { t: 'قيمي', s: 'ما تؤمن به، ما يوجهك', fields: [{ l: 'أهم 3 قيم لديّ', p: 'الصدق، الشجاعة، اللطف...' }, { l: 'ما أؤمن به بعمق', p: 'أؤمن بأن كل إنسان...' }, { l: 'ما أندم عليه', p: 'عدم قول أحبك أكثر...' }] },
      { t: 'نصائحي للحياة', s: 'حكمة لمن يأتي بعد', fields: [{ l: 'لأطفالي', p: 'لا تتوقفوا أبداً عن التعلم...' }, { l: 'لأحفادي', p: 'العالم الذي ترثونه...' }, { l: 'لأجيال لن أرها أبداً', p: 'عندما تقرأون هذا...' }] },
      { t: 'كنوزي', s: 'ما تحب، ما غيّرك', fields: [{ l: 'وصفتي المفضلة', p: 'فطيرة جدتي...' }, { l: 'الأغنية التي تعرفني', p: 'لأن أول مرة سمعتها...' }, { l: 'الكتاب الذي غيّرني', p: 'جعلني أرى العالم بشكل مختلف...' }, { l: 'المكان الذي أشعر فيه بالوطن', p: 'هناك مقعدٌ عند النهر...' }] },
      { t: 'رسائل شخصية', s: 'كلمات موجهة فقط لهم', fields: [{ l: 'رسالة لشخص تحبه', p: 'عزيزي، هناك أشياء لم أقلها أبداً...' }, { l: 'رسالة لجيل مستقبلي', p: 'لن تعرفونني أبداً، لكن...' }] },
      { t: 'إرثي', s: 'ما تتركه خلفك', fields: [{ l: 'ما أفتخر به أكثر', p: 'أنني وفيت بوعدي...' }, { l: 'ما أود أن أُذكر من أجله', p: 'شخصٌ كان حاضراً...' }, { l: 'كلماتي الأخيرة', p: 'إذا كنتم تقرأون هذا، فاعلموا أنني عشت.' }] },
    ],
    zh: [
      { t: '我是谁', s: '你的起源、童年、塑造你的事物', fields: [{ l: '出生日期和地点', p: '1985年3月15日，巴黎...' }, { l: '用几句话描述我的童年', p: '一个永恒的夏天...' }, { l: '什么塑造了我', p: '当我意识到的那一天...' }] },
      { t: '我的价值观', s: '你的信仰，指引你的东西', fields: [{ l: '我最重要的3个价值观', p: '诚实、勇气、善良...' }, { l: '我深深相信的', p: '我相信每个人类...' }, { l: '我后悔的', p: '没有多说我爱你...' }] },
      { t: '我的人生建议', s: '给后来者的智慧', fields: [{ l: '给我的孩子', p: '永远不要停止学习...' }, { l: '给我的孙辈', p: '你们继承的世界...' }, { l: '给我永远见不到的后代', p: '当你们读到这个时...' }] },
      { t: '我的珍宝', s: '你热爱的、改变你的事物', fields: [{ l: '我最喜欢的食谱', p: '我祖母的馅饼...' }, { l: '定义我的那首歌', p: '因为第一次听到它时...' }, { l: '改变我的那本书', p: '它让我看到了不同的世界...' }, { l: '我感到宾至如归的地方', p: '河边有一条长椅...' }] },
      { t: '私人信件', s: '只给他们的话', fields: [{ l: '给你爱的人的信', p: '亲爱的，有些话我从未说过...' }, { l: '给未来一代的信', p: '你们永远不会认识我，但是...' }] },
      { t: '我的遗产', s: '你留下的东西', fields: [{ l: '我最自豪的', p: '我信守了诺言...' }, { l: '我希望人们记住我的', p: '一个出现的人...' }, { l: '我的遗言', p: '如果你在阅读这个，请知道我活过。' }] },
    ],
    ja: [
      { t: '私は誰か', s: 'あなたの起源、子供時代、あなたを築いたもの', fields: [{ l: '生年月日と場所', p: '1985年3月15日、パリ...' }, { l: '私の子供時代を一言で', p: '永遠に続いた夏...' }, { l: '私を築いたもの', p: '気づいたあの日...' }] },
      { t: '私の価値観', s: 'あなたが信じるもの、あなたを導くもの', fields: [{ l: '私の最も重要な3つの価値観', p: '誠実さ、勇気、優しさ...' }, { l: '私が深く信じていること', p: '私はすべての人間が...' }, { l: '私が後悔していること', p: 'もっと愛してると言わなかったこと...' }] },
      { t: '私の人生のアドバイス', s: '後に続く人たちへの知恵', fields: [{ l: '私の子供たちへ', p: '学ぶのをやめないで...' }, { l: '私の孫たちへ', p: 'あなたが受け継ぐ世界...' }, { l: '私が決して見ることのない世代へ', p: 'これを読む頃には...' }] },
      { t: '私の宝物', s: 'あなたが愛するもの、あなたを変えたもの', fields: [{ l: '私のお気に入りのレシピ', p: '祖母のタルト...' }, { l: '私を定義する曲', p: '初めて聴いた時に...' }, { l: '私を変えた本', p: '違う視点で見るようになった...' }, { l: '私が家だと感じる場所', p: '川沿いにベンチがある...' }] },
      { t: '個人的な手紙', s: '彼らだけを意図した言葉', fields: [{ l: '愛する人への手紙', p: '親愛なる人、言えなかったことがある...' }, { l: '未来の世代への手紙', p: 'あなたは私を知らないだろうが...' }] },
      { t: '私の遺産', s: 'あなたが残すもの', fields: [{ l: '私が最も誇りに思うこと', p: '約束を守ったこと...' }, { l: 'どのように覚えてほしいか', p: 'そこにいた人として...' }, { l: '私の最後の言葉', p: 'これを読んでいるなら、私が生きたことを知ってほしい。' }] },
    ],
    ko: [
      { t: '나는 누구인가', s: '당신의 기원, 어린 시절, 당신을 만든 것', fields: [{ l: '출생일과 장소', p: '1985년 3월 15일, 파리...' }, { l: '몇 마디로 표현하는 나의 어린 시절', p: '영원히 지속된 여름...' }, { l: '나를 만든 것', p: '내가 깨달은 그 날...' }] },
      { t: '나의 가치관', s: '당신이 믿는 것, 당신을 인도하는 것', fields: [{ l: '나의 가장 중요한 3가지 가치', p: '정직, 용기, 친절...' }, { l: '내가 깊이 믿는 것', p: '나는 모든 인간이...' }, { l: '내가 후회하는 것', p: '사랑한다고 더 많이 말하지 않은 것...' }] },
      { t: '나의 인생 조언', s: '뒤따를 사람들을 위한 지혜', fields: [{ l: '내 아이들에게', p: '절대 배우는 것을 멈추지 마...' }, { l: '내 손자들에게', p: '네가 물려받는 세상...' }, { l: '내가 결코 보지 못할 세대에게', p: '이것을 읽을 때쯤이면...' }] },
      { t: '나의 병보', s: '당신이 사랑하는 것, 당신을 변화시킨 것', fields: [{ l: '내가 가장 좋아하는 레시피', p: '할머니의 타르트...' }, { l: '나를 정의하는 노래', p: '처음 들었을 때...' }, { l: '나를 변화시킨 책', p: '다르게 보게 만들었다...' }, { l: '내가 집처럼 느끼는 곳', p: '강가에 벤치가 있다...' }] },
      { t: '개인적인 편지', s: '그들만을 위해 쓴 말', fields: [{ l: '사랑하는 사람에게 볂는 편지', p: '사랑하는 사람아, 내가 결코 말하지 못한 것들이...' }, { l: '미래 세대에게 볂는 편지', p: '당신은 나를 결코 알지 못하겠지만...' }] },
      { t: '나의 유산', s: '당신이 남기는 것', fields: [{ l: '내가 가장 자랑스러운 것', p: '약속을 지킨 것...' }, { l: '어떤 사람으로 기억되고 싶은지', p: '거기에 있던 사람...' }, { l: '나의 마지막 말', p: '이것을 읽고 있다면, 내가 살았다는 것을 알아주길.' }] },
    ],
    ru: [
      { t: 'КТО Я', s: 'Твои корни, детство, что сформировало тебя', fields: [{ l: 'Дата и место рождения', p: '15 марта 1985, Париж...' }, { l: 'Моё детство в нескольких словах', p: 'Лето, которое длилось вечно...' }, { l: 'Что сформировало меня', p: 'В тот день, когда я осознал...' }] },
      { t: 'МОИ ЦЕННОСТИ', s: 'Во что ты веришь, что тебя ведёт', fields: [{ l: 'Мои 3 самых важных ценности', p: 'Честность, смелость, доброта...' }, { l: 'Во что я глубоко верю', p: 'Я верю, что каждый человек...' }, { l: 'О чём я сожалею', p: 'Что не говорил я тебя люблю чаще...' }] },
      { t: 'МОИ СОВЕТЫ ПО ЖИЗНИ', s: 'Мудрость для тех, кто следует', fields: [{ l: 'Моим детям', p: 'Никогда не переставайте учиться...' }, { l: 'Моим внукам', p: 'Мир, который вы наследуете...' }, { l: 'Поколениям, которых я никогда не увижу', p: 'Когда вы прочтёте это...' }] },
      { t: 'МОИ СОКРОВИЩА', s: 'Что ты любишь, что изменило тебя', fields: [{ l: 'Мой любимый рецепт', p: 'Тарт моей бабушки...' }, { l: 'Песня, которая определяет меня', p: 'Потому что в первый раз, когда я услышал её...' }, { l: 'Книга, которая изменила меня', p: 'Она заставила меня видеть по-другому...' }, { l: 'Место, где я чувствую себя дома', p: 'Там есть скамейка у реки...' }] },
      { t: 'ЛИЧНЫЕ ПИСЬМА', s: 'Слова, предназначенные только для них', fields: [{ l: 'Письмо тому, кого ты любишь', p: 'Дорогой, есть вещи, которые я никогда не говорил...' }, { l: 'Письмо будущему поколению', p: 'Вы никогда не узнаете меня, но...' }] },
      { t: 'МОЁ НАСЛЕДИЕ', s: 'Что ты оставляешь после себя', fields: [{ l: 'Чем я горжусь больше всего', p: 'Что я сдержал своё слово...' }, { l: 'Как я хотел бы быть запомненным', p: 'Кто-то, кто был рядом...' }, { l: 'Мои последние слова', p: 'Если вы читаете это, знайте, что я жил.' }] },
    ],
    hi: [
      { t: 'मैं कौन हूँ', s: 'आपकी जड़ें, बचपन, जिसने आपको बनाया', fields: [{ l: 'जन्म की तारीख और स्थान', p: '15 मार्च 1985, पेरिस...' }, { l: 'कुछ शब्दों में मेरा बचपन', p: 'एक गर्मी जो हमेशा के लिए रही...' }, { l: 'जिसने मुझे बनाया', p: 'जिस दिन मुझे एहसास हुआ...' }] },
      { t: 'मेरे मूल्य', s: 'आप किस में विश्वास करते हैं, आपका मार्गदर्शन क्या है', fields: [{ l: 'मेरे 3 सबसे महत्वपूर्ण मूल्य', p: 'ईमानदारी, साहस, दयालुता...' }, { l: 'जिस पर मैं गहराई से विश्वास करता हूँ', p: 'मैं मानता हूँ कि हर इंसान...' }, { l: 'जिसका मुझे पछतावा है', p: 'इतना प्यार न कहना...' }] },
      { t: 'मेरी जीवन सलाह', s: 'आने वालों के लिए बुद्धिमानी', fields: [{ l: 'मेरे बच्चों के लिए', p: 'कभी सीखना मत छोड़ना...' }, { l: 'मेरे पोते-पोतियों के लिए', p: 'वह दुनिया जो तुम्हें मिली है...' }, { l: 'उन पीढ़ियों के लिए जिन्हें मैं कभी नहीं देखूँगा', p: 'जब तुम यह पढ़ोगे...' }] },
      { t: 'मेरे खजाने', s: 'जो तुम प्यार करते हो, जिसने तुम्हें बदला', fields: [{ l: 'मेरी पसंदीदा रेसिपी', p: 'मेरी दादी का टार्ट...' }, { l: 'वह गाना जो मुझे परिभाषित करता है', p: 'क्योंकि पहली बार जब मैंने सुना...' }, { l: 'वह किताब जिसने मुझे बदला', p: 'इसने मुझे अलग तरह से देखना सिखाया...' }, { l: 'वह जगह जहाँ मैं घर महसूस करता हूँ', p: 'नदी के किनारे एक बेंच है...' }] },
      { t: 'निजी पत्र', s: 'उनके लिए विशेष शब्द', fields: [{ l: 'किसी प्रियजन को पत्र', p: 'प्रिय, कुछ बातें हैं जो मैंने कभी नहीं कहीं...' }, { l: 'भावी पीढ़ी को पत्र', p: 'तुम मुझे कभी नहीं जानोगे, लेकिन...' }] },
      { t: 'मेरी विरासत', s: 'आपके पीछे छोड़ी गई चीज़', fields: [{ l: 'जिस पर मुझे सबसे ज़्यादा गर्व है', p: 'कि मैंने अपना वादा निभाया...' }, { l: 'जिसके लिए मुझे याद रखा जाना चाहिए', p: 'वह व्यक्ति जो वहाँ था...' }, { l: 'मेरे आखिरी शब्द', p: 'अगर तुम यह पढ़ रहे हो, तो जान लो कि मैं जिया।' }] },
    ],
    sw: [
      { t: 'MIMI NI NANI', s: 'Asili zako, utoto wako, kilichokujenga', fields: [{ l: 'Tarehe na mahali pa kuzaliwa', p: '15 Machi 1985, Paris...' }, { l: 'Utoto wangu kwa maneno machache', p: 'Majira ya joto yaliyodumu milele...' }, { l: 'Kilinichojenga', p: 'Siku nilipogundua...' }] },
      { t: 'MAADILI YANGU', s: 'Unayoiamini, yanayokuongoza', fields: [{ l: 'Maadili yangu 3 muhimu zaidi', p: 'Ukweli, ujasiri, wema...' }, { l: 'Ninachoiamini kwa undani', p: 'Naamini kila mwanadamu...' }, { l: 'Ninayojutia', p: 'Kusema nakupenda mara chache...' }] },
      { t: 'USHAURI WANGU WA MAISHA', s: 'Hekima kwa wale wanaofuata', fields: [{ l: 'Kwa watoto wangu', p: 'Kamwe msiiache kujifunza...' }, { l: 'Kwa wajukuu wangu', p: 'Dunia mnayoirithi...' }, { l: 'Kwa vizazi sitaona kamwe', p: 'Wakati mtakaposoma hivi...' }] },
      { t: 'HAZINA ZANGU', s: 'Unachopenda, kilichokubadili', fields: [{ l: 'Mapishi yangu pendwa', p: 'Tart ya bibi yangu...' }, { l: 'Wimbo unaonifafanua', p: 'Kwa sababu mara ya kwanza niliposikia...' }, { l: 'Kitabu kilichonibadili', p: 'Kilinifanya nione tofauti...' }, { l: 'Mahali napohisi nyumbani', p: 'Kuna benchi karibu na mto...' }] },
      { t: 'BARUA ZA KIBINAFSI', s: 'Maneno yaliyolenga wao tu', fields: [{ l: 'Barua kwa mtu umpendaye', p: 'Mpendwa, kuna mambo sikuyasema...' }, { l: 'Barua kwa kizazi cha baadaye', p: 'Hutanijua kamwe, lakini...' }] },
      { t: 'URITHI WANGU', s: 'Unachokiacha nyuma', fields: [{ l: 'Ninachojivunia zaidi', p: 'Kwa kushika neno langu...' }, { l: 'Ningependa kukumbukwa kwa nini', p: 'Mtu aliyekuwepo...' }, { l: 'Maneno yangu ya mwisho', p: 'Kama mnasoma hii, jueni kwamba nimeishi.' }] },
    ],
    nl: [
      { t: 'WIE IK BEN', s: 'Je oorsprong, je kindertijd, wat je heeft opgebouwd', fields: [{ l: 'Geboortedatum en -plaats', p: '15 maart 1985, Parijs...' }, { l: 'Mijn kindertijd in enkele woorden', p: 'Een zomer die eeuwig leek te duren...' }, { l: 'Wat mij heeft opgebouwd', p: 'De dag dat ik besefte...' }] },
      { t: 'MIJN WAARDEN', s: 'Waarin je gelooft, wat je leidt', fields: [{ l: 'Mijn 3 belangrijkste waarden', p: 'Eerlijkheid, moed, vriendelijkheid...' }, { l: 'Waarin ik diep geloof', p: 'Ik geloof dat elke mens...' }, { l: 'Waar ik spijt van heb', p: 'Niet vaker gezegd te hebben dat ik van je hou...' }] },
      { t: 'MIJN LEVENSADVIES', s: 'Wijsheid voor degenen die volgen', fields: [{ l: 'Aan mijn kinderen', p: 'Houd nooit op met leren...' }, { l: 'Aan mijn kleinkinderen', p: 'De wereld die jullie erven...' }, { l: 'Aan generaties die ik nooit zal zien', p: 'Tegen de tijd dat jullie dit lezen...' }] },
      { t: 'MIJN SCHATTEN', s: 'Wat je liefhebt, wat je veranderde', fields: [{ l: 'Mijn favoriete recept', p: 'De taart van mijn grootmoeder...' }, { l: 'Het lied dat mij definieert', p: 'Omdat ik het de eerste keer hoorde...' }, { l: 'Het boek dat mij veranderde', p: 'Het liet mij anders zien...' }, { l: 'De plek waar ik me thuis voel', p: 'Er is een bankje aan de rivier...' }] },
      { t: 'PERSOONLIJKE BRIEVEN', s: 'Woorden alleen voor hen bedoeld', fields: [{ l: 'Een brief aan iemand van wie je houdt', p: 'Lieve, er zijn dingen die ik nooit zei...' }, { l: 'Een brief aan een toekomstige generatie', p: 'Jullie zullen mij nooit kennen, maar...' }] },
      { t: 'MIJN NALATENSCHAP', s: 'Wat je achterlaat', fields: [{ l: 'Waar ik het meest trots op ben', p: 'Dat ik mijn woord heb gehouden...' }, { l: 'Waarvoor ik graag wordt herinnerd', p: 'Iemand die er was...' }, { l: 'Mijn laatste woorden', p: 'Als je dit leest, weet dan dat ik heb geleefd.' }] },
    ],
  };
  return data[lang] || data.en;
}

export function getChallenges(): Challenge[] {
  return [
    { id: '1', q: 'What is happiness to you?', ans: [{ a: 'Marie', y: 2024, text: 'Happiness is a quiet Sunday morning with no plan.' }] },
    { id: '2', q: 'What advice would you give your younger self?', ans: [{ a: 'Robert', y: 2024, text: 'Stop waiting. Everything you want is waiting for you to be brave.' }] },
    { id: '3', q: 'Your era in 3 words?', ans: [{ a: 'Sophie', y: 2024, text: 'Anxious. Connected. Searching.' }] },
    { id: '4', q: 'What do you hope for your descendants?', ans: [{ a: 'Jean', y: 2024, text: 'That kindness is unremarkable because it is ordinary.' }] },
    { id: '5', q: 'What was your greatest fear?', ans: [] },
  ];
}

export const INITIAL_TREE: TreeNode[] = [
  { id: 1, n: 'Robert Doe', b: 1952, x: 180, y: 60, gen: 0 },
  { id: 2, n: 'Irène Doe', b: 1955, x: 360, y: 60, gen: 0 },
  { id: 3, n: 'Jean Doe', b: 1982, x: 120, y: 180, gen: 1 },
  { id: 4, n: 'Marie Doe', b: 1985, x: 300, y: 180, gen: 1 },
  { id: 5, n: 'Sophie Doe', b: 1988, x: 480, y: 180, gen: 1 },
  { id: 6, n: 'Lucas Doe', b: 2024, x: 210, y: 300, gen: 2 },
];

export const TREE_LINKS: [number, number][] = [[1,3],[1,4],[2,3],[2,4],[1,5],[2,5],[3,6],[4,6]];

export const DNA_SERVICES = [
  { name: '23andMe', desc: 'Health + ancestry DNA · most popular worldwide', url: 'https://www.23andme.com' },
  { name: 'Ancestry', desc: 'Largest family history database · 18B+ records', url: 'https://www.ancestry.com' },
  { name: 'MyHeritage', desc: 'Best for European origins · family tree builder', url: 'https://www.myheritage.com' },
  { name: 'FamilyTreeDNA', desc: 'Most detailed Y-DNA · mtDNA analysis', url: 'https://www.familytreedna.com' },
  { name: 'LivingDNA', desc: 'Best for African & British ancestry details', url: 'https://www.livingdna.com' },
  { name: 'Geneanet', desc: 'Free genealogy · 6B+ records · strong in France', url: 'https://www.geneanet.org' },
];
