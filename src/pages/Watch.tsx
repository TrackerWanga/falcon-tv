import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

const API = 'https://tv-api-gateway.trackerwanga254.workers.dev/v1';
const STREAMS_URL = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/streams_matched.json';

function flag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  return String.fromCodePoint(code.charCodeAt(0)+127397) + String.fromCodePoint(code.charCodeAt(1)+127397);
}
const NAMES: Record<string,string> = {US:'United States',UK:'United Kingdom',CA:'Canada',AU:'Australia',IN:'India',DE:'Germany',FR:'France',JP:'Japan',BR:'Brazil',ES:'Spain',IT:'Italy',MX:'Mexico',KR:'South Korea',AR:'Argentina',ZA:'South Africa',KE:'Kenya',NG:'Nigeria',AE:'UAE'};
function cname(code:string){return NAMES[code]||code;}

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const [channel, setChannel] = useState<any>(null);
  const [streamUrl, setStreamUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(true);

  useEffect(() => {
    if (!id) return;
    const decoded = decodeURIComponent(id);
    
    Promise.all([
      fetch(`${API}/channels/${decoded}`).then(r => r.json()),
      fetch(STREAMS_URL).then(r => r.json())
    ]).then(([ch, streamsData]) => {
      setChannel(ch);
      const streams = streamsData.streams || {};
      const entry = streams[ch.id];
      if (entry) {
        const url = typeof entry === 'string' ? entry : entry.url;
        setStreamUrl(url);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-500 animate-spin"/></div>;
  if (!channel) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center"><div><span className="text-6xl block mb-4">📡</span><h2 className="text-xl font-bold text-white mb-2">Not Found</h2><Link to="/" className="text-red-500 text-sm">← Back</Link></div></div>;

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 px-4 h-14 flex items-center gap-4">
        <Link to="/" className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft className="w-4 h-4"/>Back</Link>
        <span className="text-white font-medium truncate text-sm">{channel.name}</span>
        {streamUrl && <span className="ml-auto px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>LIVE</span>}
      </nav>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {channel.logo?<img src={channel.logo} className="w-full h-full object-contain p-2" onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>:null}
            <span className={`text-3xl ${channel.logo?'hidden':''}`}>{flag(channel.country||'')}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{channel.name}</h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[11px]">{flag(channel.country||'')} {cname(channel.country||'')}</span>
              {channel.categories?.map((c:string)=><span key={c} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[11px]">{c}</span>)}
            </div>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 mb-6">
          {streamUrl ? (
            <div className="relative">
              {buffering && <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10"><Loader2 className="w-10 h-10 text-red-500 animate-spin"/></div>}
              <video controls autoPlay playsInline className="w-full aspect-video" style={{background:'#000'}} onCanPlay={()=>setBuffering(false)} onError={()=>setBuffering(false)}>
                <source src={streamUrl} type="application/x-mpegURL"/>
                <source src={streamUrl} type="video/mp4"/>
              </video>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center p-8">
              <span className="text-5xl mb-4">📡</span>
              <p className="text-white font-medium mb-2">No Stream Available</p>
              <p className="text-zinc-500 text-sm text-center">Streams refresh every 3 hours. Check back soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
