import React, { createContext, useContext, useState, useCallback } from 'react';
import type { LangCode } from './i18n';
import type { Message, HumanityMessage, Challenge, TreeNode, OriginRow } from './data';
import { getDemoMsgs, getDemoHumanity, getChallenges, INITIAL_TREE } from './data';

export type TabName = 'chain' | 'tree' | 'origins' | 'mural' | 'challenges' | 'book' | 'humanity';
export type PageName = 'onboarding' | 'landing' | 'app' | 'admin';

interface User {
  name: string;
  first: string;
  last: string;
  fb: boolean;
}

interface AppState {
  page: PageName;
  tab: TabName;
  lang: LangCode;
  user: User | null;
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
}

const StoreContext = createContext<(AppState & AppActions) | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageName>('onboarding');
  const [tab, setTab] = useState<TabName>('chain');
  const [lang, setLangState] = useState<LangCode>('en');
  const [user, setUser] = useState<User | null>(null);
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

  const value: AppState & AppActions = {
    page, tab, lang, user, premium, familyName, emo, hEmo,
    msgs, hMsgs, challenges, bookData, chapter, pacte, originRows,
    treeNodes, sideMenuOpen, inviteOpen, upgradeOpen, immersiveMsg,
    showSubmitAnim, notif,
    setPage, setTab, setLang, setUser, setPremium, setFamilyName,
    setEmo, setHEmo, addMsg: (m) => setMsgs(prev => [m, ...prev]),
    setMsgs, addHMsg: (m) => setHMsgs(prev => [m, ...prev]), setHMsgs,
    setChallenges, setBookData, setChapter, setPacte, setOriginRows,
    setTreeNodes, setSideMenuOpen, setInviteOpen, setUpgradeOpen,
    setImmersiveMsg, setShowSubmitAnim, showNotif, login,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
