import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Save, UserRound } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getBookChs } from '@/lib/data';

type FamilyBook = {
  authorId: string;
  authorName: string;
  data: Record<string, string>;
  updatedAt: string | null;
  canEdit: boolean;
};

export default function BookTab() {
  const { lang, user, session, activeFamilyId, bookData, setBookData, chapter, setChapter, showNotif } = useStore();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingOwnBook, setEditingOwnBook] = useState(true);
  const [familyBooks, setFamilyBooks] = useState<FamilyBook[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState(session?.user.id || 'local');
  const chs = getBookChs(lang);
  const currentAuthorId = session?.user.id || 'local';
  const cloudEnabled = Boolean(session?.access_token && activeFamilyId);
  const ownName = user?.name || user?.first || t('anonymous', lang);

  const visibleBooks = useMemo(() => {
    const hasMine = familyBooks.some(book => book.authorId === currentAuthorId);
    const mine: FamilyBook = {
      authorId: currentAuthorId,
      authorName: ownName,
      data: bookData,
      updatedAt: savedAt?.toISOString() || null,
      canEdit: true,
    };
    return hasMine ? familyBooks.map(book => book.authorId === currentAuthorId ? { ...book, data: bookData, canEdit: true } : book) : [mine, ...familyBooks];
  }, [bookData, currentAuthorId, familyBooks, ownName, savedAt]);

  const selectedBook = visibleBooks.find(book => book.authorId === selectedAuthorId) || visibleBooks[0];
  const canEditSelected = selectedBook?.authorId === currentAuthorId;
  const fieldsEditable = canEditSelected && editingOwnBook;
  const visibleData = canEditSelected ? bookData : selectedBook?.data || {};
  const totalFields = chs.reduce((sum, item) => sum + item.fields.length, 0);
  const completedFields = useMemo(() => Object.values(visibleData).filter(value => value.trim().length >= 10).length, [visibleData]);
  const completion = Math.round((completedFields / totalFields) * 100);

  useEffect(() => {
    setSelectedAuthorId(session?.user.id || 'local');
  }, [session?.user.id]);

  useEffect(() => {
    if (selectedAuthorId !== currentAuthorId) setEditingOwnBook(false);
  }, [currentAuthorId, selectedAuthorId]);

  useEffect(() => {
    if (!cloudEnabled) return;
    let active = true;

    fetch(`/api/family-books?familyId=${encodeURIComponent(activeFamilyId || '')}`, {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    }).then(async response => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t('familyCloudError', lang));
      if (!active) return;
      const books = Array.isArray(data.books) ? data.books as FamilyBook[] : [];
      setFamilyBooks(books);
      const mine = books.find(book => book.authorId === session?.user.id);
      if (mine) {
        setBookData(mine.data || {});
        setSavedAt(mine.updatedAt ? new Date(mine.updatedAt) : null);
        setEditingOwnBook(false);
      }
    }).catch(error => {
      if (active) showNotif(error.message || t('familyCloudError', lang), '#FF6B6B');
    });

    return () => { active = false; };
  }, [activeFamilyId, cloudEnabled, lang, session?.access_token, session?.user.id, setBookData, showNotif]);

  const updateField = (ci: number, fi: number, val: string) => {
    if (!fieldsEditable) return;
    setBookData({ ...bookData, [`${ci}-${fi}`]: val });
  };

  const saveBook = async () => {
    setSaving(true);
    localStorage.setItem('legacychain-book', JSON.stringify(bookData));

    if (!cloudEnabled) {
      setSavedAt(new Date());
      setSaving(false);
      setEditingOwnBook(false);
      showNotif(lang === 'fr' ? 'Livre enregistre' : 'Book saved', '#00FFD1');
      return;
    }

    try {
      const response = await fetch('/api/family-books', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyId: activeFamilyId, authorName: ownName, data: bookData }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || t('familyCloudError', lang));

      const saved = data.book as FamilyBook;
      setFamilyBooks(prev => {
        const withoutMine = prev.filter(book => book.authorId !== saved.authorId);
        return [saved, ...withoutMine];
      });
      setSelectedAuthorId(saved.authorId);
      setSavedAt(saved.updatedAt ? new Date(saved.updatedAt) : new Date());
      setEditingOwnBook(false);
      showNotif(lang === 'fr' ? 'Livre enregistre pour la famille' : 'Book saved for the family', '#00FFD1');
    } catch (error) {
      showNotif(error instanceof Error ? error.message : t('familyCloudError', lang), '#FF6B6B');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="font-display" style={{ fontSize: '0.95rem', color: '#00FFD1', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>{t('bookTitle', lang)}</div>
      <div style={{ fontSize: '0.68rem', color: 'rgba(239,246,255,0.35)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>{t('bookSub', lang)}</div>

      {visibleBooks.length > 1 && (
        <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.15rem' }}>
          {visibleBooks.map(book => {
            const active = selectedBook?.authorId === book.authorId;
            return (
              <button
                key={book.authorId}
                type="button"
                onClick={() => setSelectedAuthorId(book.authorId)}
                className="btn-sec"
                style={{
                  flex: '0 0 auto',
                  minHeight: 38,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  borderColor: active ? '#00FFD1' : undefined,
                  color: active ? '#00FFD1' : undefined,
                  background: active ? 'rgba(0,255,209,.06)' : undefined,
                }}
              >
                <UserRound size={13} /> {book.authorId === currentAuthorId ? (lang === 'fr' ? 'Mon livre' : 'My book') : book.authorName}
              </button>
            );
          })}
        </div>
      )}

      <div className="glass-card" style={{ marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.9rem', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.6rem' }}>
            <span style={{ color: '#00FFD1', letterSpacing: '0.1em' }}>{t('bookProgress', lang)}</span>
            <strong style={{ color: '#EFF6FF' }}>{completion}%</strong>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: 'rgba(239,246,255,0.08)', overflow: 'hidden' }}>
            <div style={{ width: `${completion}%`, height: '100%', background: 'linear-gradient(90deg,#00FFD1,#C084FC)', transition: 'width .3s ease' }} />
          </div>
          <div style={{ marginTop: '0.48rem', color: 'rgba(239,246,255,0.34)', fontSize: '0.54rem' }}>
            {completedFields}/{totalFields} {t('promptsCompleted', lang)}
          </div>
        </div>
        <div style={{ textAlign: 'center', color: savedAt ? '#00FFD1' : 'rgba(239,246,255,.3)', minWidth: 64 }}>
          {savedAt ? <CheckCircle2 size={19} style={{ margin: '0 auto 0.25rem' }} /> : <Save size={19} style={{ margin: '0 auto 0.25rem' }} />}
          <div style={{ fontSize: '0.48rem', lineHeight: 1.4 }}>
            {savedAt ? (cloudEnabled ? (lang === 'fr' ? 'Sauvegarde famille' : 'Family saved') : t('savedLocally', lang)) : t('saving', lang)}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.3rem', flexWrap: 'wrap' }}>
        {chs.map((_, i) => (
          <button
            type="button"
            key={i}
            aria-label={`${t('chapterAbbr', lang)}${i + 1}`}
            onClick={() => setChapter(i)}
            style={{
              width: 24, height: 24, borderRadius: '50%', border: `1px solid ${i === chapter ? '#00FFD1' : i < chapter ? '#00FFD1' : 'rgba(0,255,209,0.13)'}`,
              color: i === chapter ? '#04030A' : i < chapter ? '#00FFD1' : 'rgba(239,246,255,0.25)',
              background: i === chapter ? '#00FFD1' : i < chapter ? 'rgba(0,255,209,0.09)' : 'transparent',
              fontFamily: "'DM Mono',monospace", fontSize: '0.62rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, padding: 0,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div style={{ height: 2, background: 'rgba(0,255,209,0.13)', borderRadius: 1, marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#00FFD1', transition: 'width 0.5s', width: `${((chapter + 1) / chs.length) * 100}%` }} />
      </div>

      {chs.map((ch, ci) => (
        <div key={ci} style={{ display: ci === chapter ? 'block' : 'none' }}>
          <div className="font-display" style={{ fontSize: '0.9rem', color: '#00FFD1', marginBottom: '0.35rem', letterSpacing: '0.1em' }}>
            {t('chapterAbbr', lang)}{ci + 1} - {ch.t}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.3rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(239,246,255,0.35)', lineHeight: 1.7 }}>{ch.s}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', color: 'rgba(255,179,71,.6)', fontSize: '0.52rem' }}>
              <Clock3 size={12} /> {Math.max(3, ch.fields.length * 2)} min
            </span>
          </div>

          {ch.fields.map((f, fi) => (
            <div key={fi} style={{ marginBottom: '0.85rem' }}>
              <label style={{ display: 'block', fontSize: '0.62rem', color: 'rgba(239,246,255,0.42)', letterSpacing: '0.12em', marginBottom: '0.32rem' }}>
                {f.l.toUpperCase()}
              </label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 80, opacity: fieldsEditable ? 1 : 0.78 }}
                placeholder={f.p}
                value={visibleData[`${ci}-${fi}`] || ''}
                onChange={e => updateField(ci, fi, e.target.value)}
                readOnly={!fieldsEditable}
              />
            </div>
          ))}

          <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.1rem' }}>
            {ci > 0 && <button className="btn-sec" style={{ flex: 1 }} onClick={() => setChapter(ci - 1)}>{t('prevChapter', lang)}</button>}
            {ci < chs.length - 1 ? (
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setChapter(ci + 1)}>{t('nextChapter', lang)}</button>
            ) : null}
          </div>
        </div>
      ))}

      {canEditSelected && (
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.5rem' }}>
          <button className="btn-sec" style={{ flex: 1 }} onClick={() => setEditingOwnBook(true)}>
            {lang === 'fr' ? 'Modifier' : 'Edit'}
          </button>
          <button className="btn-amber" style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }} onClick={() => void saveBook()} disabled={saving}>
            <Save size={15} /> {saving ? t('saving', lang) : t('saveMessage', lang)}
          </button>
        </div>
      )}
    </div>
  );
}
