import { BookOpen, Dna, Link2, Network, Trophy } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { TabName } from '@/lib/store';

const ITEMS: { id: TabName; label: string; icon: typeof Link2 }[] = [
  { id: 'chain', label: 'navChain', icon: Link2 },
  { id: 'tree', label: 'navTree', icon: Network },
  { id: 'origins', label: 'navOrigins', icon: Dna },
  { id: 'challenges', label: 'navChal', icon: Trophy },
  { id: 'book', label: 'navBook', icon: BookOpen },
];

export default function MobileTabBar() {
  const { tab, setTab, lang } = useStore();

  return (
    <nav className="mobile-tab-bar" aria-label="Mobile navigation">
      {ITEMS.map(item => {
        const Icon = item.icon;
        const active = tab === item.id;
        return (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={active ? 'active' : ''}>
            <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
            <span>{t(item.label, lang)}</span>
          </button>
        );
      })}
    </nav>
  );
}
