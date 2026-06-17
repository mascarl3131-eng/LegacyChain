import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from './supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { LangCode } from './i18n';
import type { Message, HumanityMessage, Challenge, TreeNode, OriginRow } from './data';
import { getDemoMsgs, getDemoHumanity, getChallenges, INITIAL_TREE } from './data';

export type TabName = 'chain' | 'tree' | 'origins' | 'mural' | 'challenges' | 'book' | 'humanity';
export type PageName = 'landing' | 'landing' | 'app' | 'admin';

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
  familyName: string;
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
  setPremium: (p: boolean) => void;
  setFamilyName: (f: string) => void;
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
  logout: () => Promise<void>;
}

const StoreContext = createContext<(AppState & AppActions) | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageName>('landing');
  const [tab, setTab] = useState<TabName>('chain');
  const [lang, setLangState] = useState<LangCode>('en');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [premium, setPremium] = useState(false);
  const [familyName, setFamilyName] = useState('Doe');
  const [emo, setEmo] = useState('hope');
  const [hEmo, setHEmo] = useState('hope');
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [hMsgs, setHMsgs] = useState<HumanityMessage[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>(getChallenges());
  const [bookData, setBookData] = useState<Record<string, string>>({});
  const [chapter, setChapter] = useState(0);
  const [pacte, setPacte] = useState(false);
  const [originRows, setOriginRows] = useState<OriginRow[]>([
    { c: 'France', p: 40 },
    { c: 'Senegal', p: 35 },
    { c: 'Vietnam', p: 25 },
  ]);
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>(INITIAL_TREE);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [immersiveMsg, setImmersiveMsg] = useState<Message | null>(null);
  const [showSubmitAnim, setShowSubmitAnim] = useState(false);
  const [notif, setNotif] = useState<{ msg: string; color: string } | null>(null);

  // Sync Supabase session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        syncUserFromSupabase(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        syncUserFromSupabase(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUserFromSupabase = (sbUser: SupabaseUser) => {
    const name = sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'User';
    const pts = name.trim().split(' ');
    setUser({
      name: name.trim(),
      first: pts[0],
      last: pts[pts.length - 1] || 'Doe',
      email: sbUser.email,
      avatar: sbUser.user_metadata?.avatar_url,
      fb: false,
    });
    setFamilyName(pts[pts.length - 1] || 'Doe');
  };

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const showNotif = useCallback((msg: string, color: string = '#00FFD1') => {
    setNotif({ msg, color });
    setTimeout(() => setNotif(null), 2800);
  }, []);

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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: "https://legacy-chain.vercel.app",
      },
    });
    if (error) {
      showNotif('Erreur Google: ' + error.message, '#FF4444');
    }
  }, [showNotif]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setPage('landing');
    showNotif('👋 Déconnecté', '#00FFD1');
  }, [showNotif]);

  const value: AppState & AppActions = {
    page, tab, lang, user, session, premium, familyName, emo, hEmo,
    msgs, hMsgs, challenges, bookData, chapter, pacte, originRows,
    treeNodes, sideMenuOpen, inviteOpen, upgradeOpen, immersiveMsg,
    showSubmitAnim, notif, loading,
    setPage, setTab, setLang, setUser, setPremium, setFamilyName,
    setEmo, setHEmo, addMsg: (m) => setMsgs(prev => [m, ...prev]),
    setMsgs, addHMsg: (m) => setHMsgs(prev => [m, ...prev]), setHMsgs,
    setChallenges, setBookData, setChapter, setPacte, setOriginRows,
    setTreeNodes, setSideMenuOpen, setInviteOpen, setUpgradeOpen,
    setImmersiveMsg, setShowSubmitAnim, showNotif, login,
    loginWithGoogle, logout,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
