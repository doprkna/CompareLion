'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useLocale } from '@/lib/i18n/useLocale';
import { useT } from '@/lib/i18n/useT';
import DailyEventCard from '@/components/DailyEventCard';

type FeedItem = {
  id: string;
  question: string;
  answers: string[];
  reactionsLike: number;
  reactionsLaugh: number;
  reactionsThink: number;
  createdAt: string;
  // Optional tags if backend includes them later
  tags?: string[];
};

type FeedResponse = {
  success: boolean;
  items: FeedItem[];
  nextCursor?: string;
  hasMore: boolean;
};

export default function FeedPage() {
  const { lang, region } = useLocale();
  const t = useT();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [sortMode, setSortMode] = useState<'recent' | 'reacted'>('recent');
  const [tab, setTab] = useState<'blend' | 'trending' | 'global'>('blend');
  const [onlyLocalHumor, setOnlyLocalHumor] = useState<boolean>(false);
  const [showMature, setShowMature] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const v = window.localStorage.getItem('feed.showMature');
    return v === '1';
  });
  const maxItems = 100;
  const pageSize = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const inflightRef = useRef<Promise<void> | null>(null);

  const canLoad = hasMore && !loading && loadedCount < maxItems;

  const loadPage = useCallback(async () => {
    if (!canLoad) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(pageSize));
      params.set('lang', lang);
      params.set('region', region);
      if (cursor) params.set('cursor', cursor);

      let url = '';
      if (tab === 'trending') {
        url = `/api/trending?region=${encodeURIComponent(region)}&limit=${pageSize}`;
      } else if (tab === 'global') {
        url = `/api/trending?region=GLOBAL&limit=${pageSize}`;
      } else {
        url = `/api/feed?${params.toString()}`;
      }

      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const newItems = (data.items || data.questions || []).map((q: any) => ({
          id: q.id,
          question: q.text || q.question || q.texts?.[0] || '',
          answers: q.answers || [],
          reactionsLike: q.reactions?.like ?? q.reactionsLike ?? 0,
          reactionsLaugh: q.reactions?.laugh ?? q.reactionsLaugh ?? 0,
          reactionsThink: q.reactions?.think ?? q.reactionsThink ?? 0,
          createdAt: q.createdAt,
          tags: q.tags || [],
          region: q.region || 'GLOBAL',
        }));
        setItems(prev => tab === 'blend' ? [...prev, ...newItems] : newItems);
        setCursor(data.nextCursor);
        setHasMore(tab === 'blend' ? Boolean(data.hasMore) && (loadedCount + newItems.length) < maxItems : false);
        setLoadedCount(prev => (tab === 'blend' ? prev + newItems.length : newItems.length));
      } else {
        setHasMore(false);
      }
    } catch {
      // soft-fail
    } finally {
      setLoading(false);
    }
  }, [canLoad, cursor, loadedCount, tab, lang, region]);

  useEffect(() => {
    // initial and when tab changes: reset list (except infinite for blend)
    setItems([]);
    setCursor(undefined);
    setHasMore(true);
    setLoadedCount(0);
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, lang, region]);

  useEffect(() => {
    try {
      window.localStorage.setItem('feed.showMature', showMature ? '1' : '0');
    } catch {}
  }, [showMature]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) {
        if (!inflightRef.current) {
          const p = (async () => {
            await loadPage();
          })();
          inflightRef.current = p.finally(() => {
            inflightRef.current = null;
          }) as unknown as Promise<void>;
        }
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadPage]);

  const handleShare = useCallback(async (id: string) => {
    const url = `${window.location.origin}/feed#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      toast.info(url);
    }
  }, []);

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const sendReaction = useCallback((id: string, type: 'like' | 'laugh' | 'think') => {
    // debounce by id+type
    const key = `${id}:${type}`;
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);
    debounceTimers.current[key] = setTimeout(async () => {
      try {
        await fetch('/api/reaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comparisonId: id, type }),
        });
      } catch {
        // ignore
      }
    }, 500);
  }, []);

  const onReact = useCallback((id: string, type: 'like' | 'laugh' | 'think') => {
    // optimistic update
    setItems(prev => (prev || []).map(it => { // sanity-fix
      if (it.id !== id) return it;
      if (type === 'like') return { ...it, reactionsLike: it.reactionsLike + 1 };
      if (type === 'laugh') return { ...it, reactionsLaugh: it.reactionsLaugh + 1 };
      return { ...it, reactionsThink: it.reactionsThink + 1 };
    }));
    sendReaction(id, type);
  }, [sendReaction]);

  const sortedItems = useMemo(() => {
    if (sortMode === 'recent') return items || []; // sanity-fix
    return [...(items || [])].sort((a, b) => { // sanity-fix
      const sa = a.reactionsLike + a.reactionsLaugh + a.reactionsThink;
      const sb = b.reactionsLike + b.reactionsLaugh + b.reactionsThink;
      return sb - sa;
    });
  }, [items, sortMode]);

  const visibleItems = useMemo(() => {
    const filtered = sortedItems.filter((it: any) => {
      if (showMature) return true;
      const tags: string[] | undefined = it?.tags;
      if (!tags || tags.length === 0) return true;
      return !(tags.includes('nsfw') || tags.includes('sensitive'));
    });
    const localFiltered = onlyLocalHumor ? filtered.filter((it: any) => (it?.region || 'GLOBAL').toUpperCase() === region.toUpperCase()) : filtered;
    return localFiltered.slice(0, Math.min(localFiltered.length, maxItems));
  }, [sortedItems, showMature, onlyLocalHumor, region]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Ambient background using existing profile mode */}
      {/* <AmbientManager mode="profile" /> */}

      <div className="max-w-2xl mx-auto px-4 py-6">
        <DailyEventCard />
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('publicFeed')}</h1>
          <div className="flex items-center gap-2 text-sm">
            <button
              className={`rounded-md px-2 py-1 ${sortMode === 'recent' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
              onClick={() => setSortMode('recent')}
            >{t('recent')}</button>
            <button
              className={`rounded-md px-2 py-1 ${sortMode === 'reacted' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
              onClick={() => setSortMode('reacted')}
            >{t('mostReacted')}</button>
            <div className="ml-3 inline-flex items-center gap-1">
              <button
                className={`rounded-md px-2 py-1 ${tab === 'trending' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
                onClick={() => setTab('trending')}
              >🔥 Trending</button>
              <button
                className={`rounded-md px-2 py-1 ${tab === 'blend' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
                onClick={() => setTab('blend')}
              >🏠 My Region</button>
              <button
                className={`rounded-md px-2 py-1 ${tab === 'global' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
                onClick={() => setTab('global')}
              >🌎 Global</button>
            </div>
            <div className="ml-2 inline-flex items-center gap-2">
              <label className="text-slate-600">Show mature</label>
              <button
                type="button"
                onClick={() => setShowMature(v => !v)}
                className={`relative inline-flex h-6 w-10 items-center rounded-full border ${showMature ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300'}`}
                aria-pressed={showMature}
                aria-label="Toggle mature content"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${showMature ? 'translate-x-4' : 'translate-x-1'}`}
                />
              </button>
            </div>
            <div className="ml-2 inline-flex items-center gap-2">
              <label className="text-slate-600">Only local humor</label>
              <input
                type="checkbox"
                checked={onlyLocalHumor}
                onChange={(e) => setOnlyLocalHumor(e.target.checked)}
                className="h-4 w-4"
                aria-label="Only local humor"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {visibleItems.map(item => (
            <article key={item.id} id={item.id} className="rounded-xl border bg-white shadow-sm p-4">
              <div className="mb-2 text-base font-semibold text-slate-800 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 border-slate-300">
                  {(item as any).region || 'GLOBAL'}
                </span>
                <span>{item.question}</span>
              </div>
              {Array.isArray((item as any).tags) && (item as any).tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {(item as any).tags.map((tag: string) => (
                    <span key={tag} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                      tag === 'nsfw' || tag === 'sensitive' ? 'border-rose-300 text-rose-700' : 'border-slate-300 text-slate-700'
                    }`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <ul className="mb-3 space-y-1 text-slate-700">
                {(item.answers || []).slice(0, 2).map((a, idx) => ( // sanity-fix
                  <li key={idx} className="pl-2">• {a}</li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="group inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-slate-100"
                    onClick={() => onReact(item.id, 'like')}
                    aria-label="Like"
                  >
                    <span className="transition-transform group-hover:scale-110">👍</span>
                    <span className="tabular-nums text-slate-700">{item.reactionsLike}</span>
                  </button>
                  <button
                    className="group inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-slate-100"
                    onClick={() => onReact(item.id, 'laugh')}
                    aria-label="Laugh"
                  >
                    <span className="transition-transform group-hover:scale-110">😂</span>
                    <span className="tabular-nums text-slate-700">{item.reactionsLaugh}</span>
                  </button>
                  <button
                    className="group inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-slate-100"
                    onClick={() => onReact(item.id, 'think')}
                    aria-label="Think"
                  >
                    <span className="transition-transform group-hover:scale-110">🤔</span>
                    <span className="tabular-nums text-slate-700">{item.reactionsThink}</span>
                  </button>
                </div>

                <button
                  className="rounded-md px-2 py-1 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  onClick={() => handleShare(item.id)}
                >
                  {t('share')}
                </button>
              </div>
            </article>
          ))}
        </div>

        <div ref={sentinelRef} className="h-10" />

        {loading && (
          <div className="py-6 text-center text-slate-500">{t('loading')}</div>
        )}
        {!hasMore && (
          <div className="py-6 text-center text-slate-400 text-sm">{t('endOfFeed')}</div>
        )}
      </div>
    </div>
  );
}













