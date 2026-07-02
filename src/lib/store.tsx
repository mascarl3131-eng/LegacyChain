import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from './supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { LangCode } from './i18n';
import { t } from './i18n';
import type { Message, HumanityMessage, Challenge, TreeNode, OriginRow } from './data';
import { getDemoMsgs, getDemoHumanity, getChallenges, INITIAL_TREE } from './data';

export type TabName = 'chain' | 'tree' | 'origins' | 'journey' | 'mural' | 'challenges' | 'book' | 'humanity';
export type PageName = 'onboarding' | 'landing' | 'app' | 'admin';

const SUPPORTED_LANGS: LangCode[] = ['en', 'fr', 'es', 'pt', 'de', 'it', 'ar', 'zh', 'ja', 'ko', 'ru', 'hi', 'sw', 'nl'];
const FOUNDER_PREMIUM_EMAILS = new Set(['mascarl3131@gmail.com']);

function getInitialLanguage(): LangCode {
  const saved = localStorage.getItem('legacychain-language');
  if (saved && SUPPORTED_LANGS.includes(saved as LangCode)) return saved as LangCode;

  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const locale of candidates) {
    const normalized = locale.toLowerCase();
    const exact = normalized.split('-')[0] as LangCode;
    if (SUPPORTED_LANGS.includes(exact)) return exact;
  }
  return 'en';
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    return JSON.parse(saved) as T;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local storage can fail in private browsing or full storage; cloud sync still works when signed in.
  }
}

interface User {
  name: string;
  first: string;
  last: string;
  email?: string;
  avatar?: string;
  fb: boolean;
}

interface AppState {
  page: PageName;
  tab: TabName;
  lang: LangCode;
  user: User | null;
  session: Session | null;
  premium: boolean;
  premiumPreview: boolean;
  premiumLoading: boolean;
  premiumCheckoutLoading: boolean;
  premiumCheckoutError: string | null;
  familyName: string;
  activeFamilyId: string | null;
  emo: string;
  hEmo: string;
  msgs: Message[];
  hMsgs: HumanityMessage[];
  challenges: Challenge[];
  bookData: Record<string, string>;
  chapter: number;
  pacte: boolean;
  originRows: OriginRow[];
  treeNodes: TreeNode[];
  sideMenuOpen: boolean;
  inviteOpen: boolean;
  upgradeOpen: boolean;
  immersiveMsg: Message | null;
  showSubmitAnim: boolean;
  notif: { msg: string; color: string } | null;
  loading: boolean;
}

interface AppActions {
  setPage: (p: PageName) => void;
  setTab: (t: TabName) => void;
  setLang: (l: LangCode) => void;
  setUser: (u: User | null) => void;
  purchasePremium: () => Promise<void>;
  refreshPremium: () => Promise<void>;
  setPremiumPreview: (enabled: boolean) => Promise<boolean>;
  setFamilyName: (f: string) => void;
  setActiveFamilyId: (id: string | null) => void;
  setEmo: (e: string) => void;
  setHEmo: (e: string) => void;
  addMsg: (m: Message) => void;
  setMsgs: (m: Message[]) => void;
  addHMsg: (m: HumanityMessage) => void;
  setHMsgs: (m: HumanityMessage[]) => void;
  setChallenges: (c: Challenge[]) => void;
  setBookData: (d: Record<string, string>) => void;
  setChapter: (c: number) => void;
  setPacte: (p: boolean) => void;
  setOriginRows: (o: OriginRow[]) => void;
  setTreeNodes: (t: TreeNode[]) => void;
  setSideMenuOpen: (o: boolean) => void;
  setInviteOpen: (o: boolean) => void;
  setUpgradeOpen: (o: boolean) => void;
  setImmersiveMsg: (m: Message | null) => void;
  setShowSubmitAnim: (s: boolean) => void;
  showNotif: (msg: string, color?: string) => void;
  login: (name: string, fb: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
}

const StoreContext = createContext<(AppState & AppActions) | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageName>('landing');
  const [tab, setTab] = useState<TabName>('humanity');
  const [lang, setLangState] = useState<LangCode>(getInitialLanguage);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [premiumPreview, setPremiumPreviewState] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumCheckoutLoading, setPremiumCheckoutLoading] = useState(false);
  const [premiumCheckoutError, setPremiumCheckoutError] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState(() => readLocalJson('legacychain-family-name', 'Doe'));
  const [activeFamilyId, setActiveFamilyId] = useState<string | null>(null);
  const [emo, setEmo] = useState('hope');
  const [hEmo, setHEmo] = useState('hope');
  const [msgs, setMsgs] = useState<Message[]>(() => readLocalJson('legacychain-msgs', [] as Message[]));
  const [hMsgs, setHMsgs] = useState<HumanityMessage[]>(() => readLocalJson('legacychain-humanity-msgs', [] as HumanityMessage[]));
  const [challenges, setChallenges] = useState<Challenge[]>(() => readLocalJson('legacychain-challenges', getChallenges()));
  const [bookData, setBookData] = useState<Record<string, string>>(() => readLocalJson('legacychain-book', {}));
  const [chapter, setChapter] = useState(() => readLocalJson('legacychain-book-chapter', 0));
  const [pacte, setPacte] = useState(() => readLocalJson('legacychain-pacte', false));
  const [originRows, setOriginRows] = useState<OriginRow[]>(() => readLocalJson('legacychain-origins', [
    { c: 'France', p: 40 },
    { c: 'Senegal', p: 35 },
    { c: 'Vietnam', p: 25 },
  ]));
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>(() => readLocalJson('legacychain-tree-nodes', INITIAL_TREE));
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [immersiveMsg, setImmersiveMsg] = useState<Message | null>(null);
  const [showSubmitAnim, setShowSubmitAnim] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; color: string } | null>(null);

  const syncUserFromSupabase = useCallback((sbUser: SupabaseUser) => {
    const name = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User';
    const pts = name.trim().split(' ');
    setUser({
      name: name.trim(),
      first: pts[0],
      last: pts[pts.length - 1] || 'Doe',
      email: sbUser.email,
      avatar: sbUser.user_metadata?.avatar_url,
      fb: sbUser.app_metadata?.provider === 'facebook',
    });
    setFamilyName(pts[pts.length - 1] || 'Doe');
  }, []);

  const loadPremium = useCallback(async (userId: string, email?: string | null) => {
    setPremiumLoading(true);
    if (email && FOUNDER_PREMIUM_EMAILS.has(email.toLowerCase())) {
      setPremium(true);
      setPremiumLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('premium_entitlements')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Premium entitlement error:', error.message);
        setPremium(false);
      } else {
        setPremium(data?.status === 'active');
      }
    } catch (error) {
      console.error('Premium entitlement request:', error);
      setPremium(false);
    } finally {
      setPremiumLoading(false);
    }
  }, []);

  // Sync Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        syncUserFromSupabase(session.user);
          void loadPremium(session.user.id, session.user.email);
      } else {
        setPremium(false);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        syncUserFromSupabase(session.user);
          void loadPremium(session.user.id, session.user.email);
      } else {
        setUser(null);
        setPremium(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadPremium, syncUserFromSupabase]);

  useEffect(() => {
    if (!session?.access_token) {
      setActiveFamilyId(null);
      return;
    }
    let active = true;
    fetch('/api/families', { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(async response => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !active) return;
        const families = Array.isArray(data.families) ? data.families : [];
        const preferred = activeFamilyId && families.some((item: { family?: { id?: string } }) => item.family?.id === activeFamilyId)
          ? activeFamilyId
          : families[0]?.family?.id || null;
        if (preferred) {
          setActiveFamilyId(preferred);
          const family = families.find((item: { family?: { id?: string; name?: string } }) => item.family?.id === preferred)?.family;
          if (family?.name) setFamilyName(family.name);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [activeFamilyId, session?.access_token]);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    localStorage.setItem('legacychain-language', l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => { writeLocalJson('legacychain-family-name', familyName); }, [familyName]);
  useEffect(() => { writeLocalJson('legacychain-msgs', msgs); }, [msgs]);
  useEffect(() => { writeLocalJson('legacychain-humanity-msgs', hMsgs); }, [hMsgs]);
  useEffect(() => { writeLocalJson('legacychain-challenges', challenges); }, [challenges]);
  useEffect(() => { writeLocalJson('legacychain-book', bookData); }, [bookData]);
  useEffect(() => { writeLocalJson('legacychain-book-chapter', chapter); }, [chapter]);
  useEffect(() => { writeLocalJson('legacychain-pacte', pacte); }, [pacte]);
  useEffect(() => { writeLocalJson('legacychain-origins', originRows); }, [originRows]);
  useEffect(() => { writeLocalJson('legacychain-tree-nodes', treeNodes); }, [treeNodes]);

  const showNotif = useCallback((msg: string, color: string = '#00FFD1') => {
    setNotif({ msg, color });
    setTimeout(() => setNotif(null), 2800);
  }, []);

  const refreshPremium = useCallback(async () => {
    if (!session?.user.id) {
      setPremium(false);
      return;
    }
    await loadPremium(session.user.id, session.user.email);
  }, [loadPremium, session?.user.email, session?.user.id]);

  const setPremiumPreview = useCallback(async (enabled: boolean) => {
    if (!session?.access_token) return false;
    try {
      const response = await fetch('/api/admin-premium-preview', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) return false;
      setPremiumPreviewState(enabled);
      return true;
    } catch {
      return false;
    }
  }, [session?.access_token]);

  const purchasePremium = useCallback(async () => {
    setPremiumCheckoutError(null);
    setPremiumCheckoutLoading(true);

    if (!session?.access_token) {
      const message = t('loginForPremium', lang);
      setPremiumCheckoutError(message);
      setPremiumCheckoutLoading(false);
      showNotif(t('loginForPremium', lang), '#FFB347');
      return;
    }

    showNotif(t('checkoutStarting', lang), '#FFB347');
    try {
      const refreshResult = await Promise.race([
        supabase.auth.refreshSession(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);
      const accessToken = refreshResult?.data.session?.access_token || session.access_token;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.url) throw new Error(data.error || `Checkout failed (${response.status})`);
      window.location.assign(data.url);
    } catch (error) {
      console.error('Premium checkout:', error);
      const message = error instanceof Error && error.message
        ? `${t('checkoutError', lang)} ${error.message}`
        : t('checkoutError', lang);
      setPremiumCheckoutError(message);
      setPremiumCheckoutLoading(false);
      showNotif(message, '#FF4444');
    }
  }, [lang, session?.access_token, showNotif]);

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    const sessionId = params.get('session_id');

    if (checkout === 'cancelled') {
      showNotif(t('checkoutCancelled', lang), '#FFB347');
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    if (checkout !== 'success' || !sessionId) return;

    const verify = async () => {
      setPremiumLoading(true);
      try {
        const response = await fetch('/api/verify-checkout-session', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        if (!response.ok) throw new Error('Verification failed');
         await loadPremium(session.user.id, session.user.email);
        setUpgradeOpen(false);
        showNotif(t('checkoutVerified', lang), '#FFB347');
      } catch (error) {
        console.error('Premium verification:', error);
        showNotif(t('checkoutError', lang), '#FF4444');
      } finally {
        setPremiumLoading(false);
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    void verify();
  }, [lang, loadPremium, session, showNotif]);

  const login = useCallback((name: string, fb: boolean) => {
    const pts = name.trim().split(' ');
    const u: User = {
      name: name.trim(),
      first: pts[0],
      last: pts[pts.length - 1] || 'Doe',
      fb,
    };
    setUser(u);
    setFamilyName(pts[pts.length - 1] || 'Doe');
    setPage('app');
    setMsgs(getDemoMsgs(lang));
    setHMsgs(getDemoHumanity(lang));
  }, [lang]);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        showNotif('Erreur Google : ' + error.message, '#FF4444');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connexion impossible';
      showNotif('Erreur Google : ' + message, '#FF4444');
    }
  }, [showNotif]);

  const loginWithFacebook = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        showNotif('Erreur Facebook : ' + error.message, '#FF6B6B');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connexion impossible';
      showNotif('Erreur Facebook : ' + message, '#FF6B6B');
    }
  }, [showNotif]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setPremiumPreviewState(false);
    setUser(null);
    setSession(null);
    setActiveFamilyId(null);
    setPage('landing');
    showNotif('👋 Déconnecté', '#00FFD1');
  }, [showNotif]);

  const value: AppState & AppActions = {
    page, tab, lang, user, session, premium: premium || premiumPreview, premiumPreview, premiumLoading, premiumCheckoutLoading,
    premiumCheckoutError, familyName, activeFamilyId, emo, hEmo,
    msgs, hMsgs, challenges, bookData, chapter, pacte, originRows,
    treeNodes, sideMenuOpen, inviteOpen, upgradeOpen, immersiveMsg,
    showSubmitAnim, notif, loading,
    setPage, setTab, setLang, setUser, purchasePremium, refreshPremium, setPremiumPreview, setFamilyName, setActiveFamilyId,
    setEmo, setHEmo, addMsg: (m) => setMsgs(prev => [m, ...prev]),
    setMsgs, addHMsg: (m) => setHMsgs(prev => [m, ...prev]), setHMsgs,
    setChallenges, setBookData, setChapter, setPacte, setOriginRows,
    setTreeNodes, setSideMenuOpen, setInviteOpen, setUpgradeOpen,
    setImmersiveMsg, setShowSubmitAnim, showNotif, login,
    loginWithGoogle, loginWithFacebook, logout,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
