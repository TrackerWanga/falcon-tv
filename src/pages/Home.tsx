import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getCountryFlag, getCountryName, type Channel } from '../lib/api';

const BASE = 'https://tv-api-gateway.trackerwanga254.workers.dev/v1';
const STREAMS_URL = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/api_streams.json';
const CATEGORIES = ['sports', 'news', 'entertainment', 'movies', 'music', 'documentary', 'kids'];
const TOP_COUNTRIES = ['US', 'UK', 'CA', 'AU', 'IN', 'KE', 'NG', 'ZA', 'DE', 'FR', 'JP', 'BR'];
const PER_PAGE = 24;

export default function Home() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'countries' | 'search'>('categories');
  const [activeCategory, setActiveCategory] = useState('sports');
  const [activeCountry, setActiveCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLiveOnly, setShowLiveOnly] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [page, setPage] = useState(0);
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Load countries and live stream IDs
  useEffect(() => {
    fetch(`${BASE}/countries`).then(r => r.json()).then(setCountries);
    fetch(STREAMS_URL).then(r => r.json()).then(d => {
      setLiveIds(new Set(Object.keys(d.streams || {})));
    });
  }, []);

  // Load channels
  useEffect(() => {
    async function load() {
      setLoading(true);
      setPage(0);
      let results: Channel[] = [];

      if (activeTab === 'search' && searchQuery.length >= 2) {
        const res = await fetch(`${BASE}/channels/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        results = data.results || [];
      } else if (activeTab === 'categories' && activeCategory) {
        const res = await fetch(`${BASE}/channels?category=${activeCategory}&limit=999`);
        const data = await res.json();
        results = data.channels || [];
      } else if (activeTab === 'countries' && activeCountry) {
        const res = await fetch(`${BASE}/channels?country=${activeCountry}&limit=999`);
        const data = await res.json();
        results = data.channels || [];
      }

      // Tag with stream availability - check both exact and fuzzy match
      const tagged = results.map(c => {
        const hasExact = liveIds.has(c.id);
        // Also check if any live ID starts with this channel's ID
        const hasFuzzy = !hasExact && [...liveIds].some(lid => 
          lid.startsWith(c.id + '@') || lid.startsWith(c.id + '-') ||
          lid.toLowerCase() === c.id.toLowerCase()
        );
        return { ...c, hasStream: hasExact || hasFuzzy };
      });

      setChannels(tagged);
      setLoading(false);
    }
    load();
  }, [activeTab, activeCategory, activeCountry, searchQuery, liveIds]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) setActiveTab('search');
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      if (value.length >= 2) setLoading(true);
    }, 300);
  };

  const displayed = showLiveOnly ? channels.filter(c => c.hasStream) : channels;
  const totalPages = Math.ceil(displayed.length / PER_PAGE);
  const paged = displayed.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const liveCount = channels.filter(c => c.hasStream).length;

  const sortedCountries = [...countries].sort((a, b) => {
    const aTop = TOP_COUNTRIES.indexOf(a), bTop = TOP_COUNTRIES.indexOf(b);
    if (aTop !== -1 && bTop !== -1) return aTop - bTop;
    if (aTop !== -1) return -1;
    if (bTop !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <span className="text-lg">📺</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Falcon TV</h1>
          </div>
          <span className="text-xs text-zinc-500 hidden sm:block">
            {liveCount} of {channels.length} live
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search 39,000+ channels..."
            className="w-full pl-11 pr-10 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-500/30" />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setActiveTab('categories'); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {[{ id: 'categories' as const, label: 'Categories' }, { id: 'countries' as const, label: 'Countries' }].map(tab => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.id ? 'bg-red-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}`}>
              {tab.label}
            </button>
          ))}
          <button onClick={() => setShowLiveOnly(!showLiveOnly)}
            className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${showLiveOnly ? 'bg-green-500 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
            <span className={`w-2 h-2 rounded-full ${showLiveOnly ? 'bg-white animate-pulse' : 'bg-green-500'}`} />
            LIVE ({liveCount})
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize ${activeCategory === cat ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'}`}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'countries' && (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-4">
              {(showAllCountries ? sortedCountries : sortedCountries.slice(0, 48)).map(code => (
                <button key={code} onClick={() => setActiveCountry(code)}
                  className={`p-2 rounded-lg text-center transition-all ${activeCountry === code ? 'bg-red-500/10 border border-red-500/30 scale-105' : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'}`}>
                  <span className="text-xl block">{getCountryFlag(code)}</span>
                  <span className="text-[10px] text-zinc-400 mt-0.5 block truncate">{getCountryName(code)}</span>
                </button>
              ))}
            </div>
            {!showAllCountries && countries.length > 48 && (
              <button onClick={() => setShowAllCountries(true)} className="text-xs text-red-500 hover:underline mb-4">
                Show all {countries.length} countries →
              </button>
            )}
          </>
        )}

        <div className="flex items-center justify-between mb-4 mt-6">
          <h2 className="text-lg font-semibold text-white">
            {activeTab === 'search' && searchQuery ? `Results for "${searchQuery}"`
              : activeTab === 'categories' ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
              : activeCountry ? getCountryFlag(activeCountry) + ' ' + getCountryName(activeCountry)
              : 'Select a country'}
          </h2>
          <span className="text-xs text-zinc-600">{displayed.length} channels</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800/50 overflow-hidden">
                <div className="aspect-[4/3] bg-zinc-800/50 animate-pulse" />
                <div className="p-3 space-y-2"><div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" /><div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" /></div>
              </div>
            ))}
          </div>
        ) : paged.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {paged.map(c => (
                <div key={c.id}
                  onClick={() => navigate(`/watch/${encodeURIComponent(c.id)}`)}
                  className="group relative rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/5 transition-all overflow-hidden cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    {c.hasStream ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-medium border border-zinc-700">
                        No stream
                      </span>
                    )}
                  </div>
                  <div className="aspect-[4/3] bg-zinc-800/20 flex items-center justify-center p-4 border-b border-zinc-800/30">
                    {c.logo ? <img src={c.logo} alt={c.name} className="max-w-full max-h-full object-contain" loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : null}
                    <span className={`text-4xl opacity-25 ${c.logo ? 'hidden' : ''}`}>{getCountryFlag(c.country)}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm truncate">{c.name}</h3>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-medium">
                        {getCountryFlag(c.country)} {c.country}
                      </span>
                      {c.categories?.slice(0, 1).map((cat: string) => (
                        <span key={cat} className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{cat}</span>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800/30 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.hasStream ? 'bg-green-500' : 'bg-zinc-600'}`} />
                      <span className={`text-[10px] ${c.hasStream ? 'text-green-500' : 'text-zinc-600'}`}>
                        {c.hasStream ? 'Streaming' : 'No signal'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30">◀</button>
                <span className="text-sm text-zinc-500">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30">▶</button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <span className="text-5xl block mb-3">📡</span>
            <p className="text-zinc-500 text-sm">
              {showLiveOnly ? 'No live channels in this category. Try turning off LIVE filter.' 
                : activeCountry ? `No channels found for ${getCountryName(activeCountry)}.`
                : 'Select a country or category.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
