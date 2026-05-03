import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';

const API = 'https://tv-api-gateway.trackerwanga254.workers.dev/v1';
const STREAMS_URL = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/streams_matched.json';

const CATEGORIES = ['sports','news','entertainment','movies','music','documentary','kids','religious','education','business'];
const TOP_COUNTRIES = ['US','UK','CA','AU','IN','KE','NG','ZA','DE','FR','JP','BR'];
const PER_PAGE = 24;

function flag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(code.charCodeAt(0)+127397) + String.fromCodePoint(code.charCodeAt(1)+127397);
}
const NAMES: Record<string,string> = {US:'United States',UK:'United Kingdom',CA:'Canada',AU:'Australia',IN:'India',DE:'Germany',FR:'France',JP:'Japan',BR:'Brazil',ES:'Spain',IT:'Italy',MX:'Mexico',KR:'South Korea',AR:'Argentina',ZA:'South Africa',KE:'Kenya',NG:'Nigeria',AE:'UAE',PK:'Pakistan',TR:'Turkey',CH:'Switzerland',NL:'Netherlands',SE:'Sweden'};
function cname(code:string){return NAMES[code]||code;}

export default function Home() {
  const nav = useNavigate();
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'categories'|'countries'|'search'>('categories');
  const [cat, setCat] = useState('sports');
  const [country, setCountry] = useState('');
  const [q, setQ] = useState('');
  const [liveOnly, setLiveOnly] = useState(false);
  const [countries, setCountries] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);

  // Load live IDs once
  useEffect(() => {
    fetch(STREAMS_URL).then(r=>r.json()).then(d=>{
      setLiveIds(new Set(Object.keys(d.streams||{})));
    });
    fetch(API+'/countries').then(r=>r.json()).then(setCountries);
  }, []);

  // Load channels
  useEffect(() => {
    setLoading(true); setPage(0);
    let url = '';
    if (tab==='search' && q.length>=2) url = `${API}/channels/search?q=${encodeURIComponent(q)}`;
    else if (tab==='categories' && cat) url = `${API}/channels?category=${cat}&limit=999`;
    else if (tab==='countries' && country) url = `${API}/channels?country=${country}&limit=999`;
    
    if (!url) { setLoading(false); return; }
    
    fetch(url).then(r=>r.json()).then(d=>{
      const ch = (d.results || d.channels || []).map((c:any) => ({
        ...c,
        hasStream: liveIds.has(c.id)
      }));
      setChannels(ch);
      setLoading(false);
    });
  }, [tab, cat, country, q, liveIds]);

  const displayed = liveOnly ? channels.filter(c=>c.hasStream) : channels;
  const paged = displayed.slice(page*PER_PAGE, (page+1)*PER_PAGE);
  const totalPages = Math.ceil(displayed.length/PER_PAGE);
  const liveCount = channels.filter(c=>c.hasStream).length;

  const sorted = [...countries].sort((a,b)=>{
    const at=TOP_COUNTRIES.indexOf(a),bt=TOP_COUNTRIES.indexOf(b);
    if(at!==-1&&bt!==-1)return at-bt; if(at!==-1)return -1; if(bt!==-1)return 1; return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20"><span className="text-lg">📺</span></div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Falcon TV</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/sports" className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold hover:bg-red-600">⚽ Sports</Link>
            <span className="text-xs text-zinc-500 hidden sm:block">{liveCount} live</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input value={q} onChange={e=>{setQ(e.target.value);if(e.target.value.length>=2)setTab('search')}} placeholder="Search 39,000+ channels..." className="w-full pl-11 pr-10 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-red-500/30" />
          {q && <button onClick={()=>{setQ('');setTab('categories')}} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"><X className="w-4 h-4"/></button>}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {[{id:'categories' as const,l:'Categories'},{id:'countries' as const,l:'Countries'}].map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setQ('')}} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab===t.id?'bg-red-500 text-white':'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>{t.l}</button>
          ))}
          <button onClick={()=>setLiveOnly(!liveOnly)} className={`ml-auto px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${liveOnly?'bg-green-500 text-white':'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>
            <span className={`w-2 h-2 rounded-full ${liveOnly?'bg-white animate-pulse':'bg-green-500'}`}/>LIVE ({liveCount})
          </button>
        </div>

        {tab==='categories'&&(
          <div className="flex gap-2 mb-6 flex-wrap">
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCat(c)} className={`px-4 py-2 rounded-lg text-xs font-medium capitalize ${cat===c?'bg-red-500/10 text-red-400 border border-red-500/30':'bg-zinc-900 text-zinc-400 border border-zinc-800'}`}>{c}</button>
            ))}
          </div>
        )}

        {tab==='countries'&&(
          <>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2 mb-4">
              {(showAll?sorted:sorted.slice(0,48)).map(c=>(
                <button key={c} onClick={()=>setCountry(c)} className={`p-2 rounded-lg text-center transition-all ${country===c?'bg-red-500/10 border border-red-500/30 scale-105':'bg-zinc-900 border border-zinc-800'}`}>
                  <span className="text-xl block">{flag(c)}</span><span className="text-[10px] text-zinc-400 mt-0.5 block truncate">{cname(c)}</span>
                </button>
              ))}
            </div>
            {!showAll&&countries.length>48&&<button onClick={()=>setShowAll(true)} className="text-xs text-red-500 hover:underline mb-4">Show all {countries.length} →</button>}
          </>
        )}

        <div className="flex items-center justify-between mb-4 mt-6">
          <h2 className="text-lg font-semibold text-white">
            {tab==='search'&&q?`"${q}"`:tab==='categories'?cat.charAt(0).toUpperCase()+cat.slice(1):country?flag(country)+' '+cname(country):'Select'}
          </h2>
          <span className="text-xs text-zinc-600">{displayed.length}</span>
        </div>

        {loading?(
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {[...Array(10)].map((_,i)=><div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800/50 overflow-hidden"><div className="aspect-[4/3] bg-zinc-800/50 animate-pulse"/><div className="p-3 space-y-2"><div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse"/><div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse"/></div></div>)}
          </div>
        ):paged.length>0?(
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {paged.map(c=>(
                <div key={c.id} onClick={()=>nav(`/watch/${encodeURIComponent(c.id)}`)} className="group relative rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-red-500/40 transition-all overflow-hidden cursor-pointer">
                  <div className="absolute top-2 right-2 z-10">
                    {c.hasStream?<span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>LIVE</span>:<span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px]">No stream</span>}
                  </div>
                  <div className="aspect-[4/3] bg-zinc-800/20 flex items-center justify-center p-4 border-b border-zinc-800/30">
                    {c.logo?<img src={c.logo} alt="" className="max-w-full max-h-full object-contain" loading="lazy" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>:null}
                    <span className={`text-4xl opacity-25 ${c.logo?'hidden':''}`}>{flag(c.country)}</span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-semibold text-sm truncate">{c.name}</h3>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 font-medium">{flag(c.country)} {c.country}</span>
                      {c.categories?.slice(0,1).map((x:string)=><span key={x} className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{x}</span>)}
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-800/30 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${c.hasStream?'bg-green-500':'bg-zinc-600'}`}/>
                      <span className={`text-[10px] ${c.hasStream?'text-green-500':'text-zinc-600'}`}>{c.hasStream?'Streaming':'No signal'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages>1&&(
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30">◀</button>
                <span className="text-sm text-zinc-500">Page {page+1} of {totalPages}</span>
                <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30">▶</button>
              </div>
            )}
          </>
        ):(
          <div className="text-center py-16"><span className="text-5xl block mb-3">📡</span><p className="text-zinc-500 text-sm">No channels found.</p></div>
        )}
      </main>
    </div>
  );
}
