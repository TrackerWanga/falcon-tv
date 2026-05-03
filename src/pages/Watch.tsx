import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCountryFlag, getCountryName, type Channel } from '../lib/api';
import { ArrowLeft } from 'lucide-react';

let cachedStreams: Record<string, any> | null = null;

async function findChannel(id: string): Promise<Channel | null> {
  // Fetch once and cache
  if (!cachedStreams) {
    try {
      const res = await fetch('https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/api_streams.json');
      const data = await res.json();
      cachedStreams = data.streams || {};
    } catch {
      return null;
    }
  }

  const decodedId = decodeURIComponent(id);
  
  // Exact match
  if (cachedStreams[decodedId]) return cachedStreams[decodedId];
  
  // Case-insensitive match
  const lowerId = decodedId.toLowerCase();
  for (const [key, value] of Object.entries(cachedStreams)) {
    if (key.toLowerCase() === lowerId) return value as Channel;
  }
  
  // Prefix match (e.g. "MorningCloudTV.ke" matches "MorningCloudTV.ke@SD")
  for (const [key, value] of Object.entries(cachedStreams)) {
    if (key.startsWith(decodedId + '@') || key.startsWith(decodedId + '-')) {
      return value as Channel;
    }
  }
  
  // Contains match
  for (const [key, value] of Object.entries(cachedStreams)) {
    if (key.toLowerCase().includes(lowerId) || lowerId.includes(key.toLowerCase())) {
      return value as Channel;
    }
  }
  
  return null;
}

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const found = await findChannel(id);
      setChannel(found);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-zinc-800 animate-pulse mx-auto" />
          <div className="h-5 w-40 bg-zinc-800 rounded animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">📡</span>
          <h2 className="text-xl font-bold text-white mb-2">Channel Not Found</h2>
          <Link to="/" className="text-red-500 hover:underline text-sm">← Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-white font-medium truncate text-sm">{channel.name}</span>
          <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500 text-white text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
          </span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {channel.logo ? (
              <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain p-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : null}
            <span className={`text-3xl ${channel.logo ? 'hidden' : ''}`}>
              {getCountryFlag(channel.country || '')}
            </span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">{channel.name}</h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 text-[11px] font-medium border border-red-500/20">
                {getCountryFlag(channel.country || '')} {getCountryName(channel.country || '')}
              </span>
              {channel.categories?.map((cat: string) => (
                <span key={cat} className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[11px]">{cat}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800 mb-6">
          <video controls autoPlay className="w-full aspect-video" style={{ background: '#000' }}>
            <source src={channel.url} type="application/x-mpegURL" />
            <source src={channel.url} type="video/mp4" />
          </video>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Quality', value: channel.quality || 'HD' },
            { label: 'Source', value: channel.source || 'IPTV' },
            { label: 'Category', value: channel.categories?.[0] || 'General' },
            { label: 'Status', value: '● Live' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/30">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">{label}</p>
              <p className="text-white font-medium text-sm">{value}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
