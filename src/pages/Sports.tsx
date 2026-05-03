import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Activity, Trophy } from 'lucide-react';

const API = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/sports.json';

export default function Sports() {
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  // Loading
  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-10 h-10 text-red-500 animate-pulse mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Loading live sports...</p>
        </div>
      </div>
    );
  }

  const { live = [], upcoming = [], highlights = [] } = data;

  // Match detail view
  if (selected) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 px-4 h-14 flex items-center gap-4">
          <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-white text-sm flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-white font-medium text-sm truncate">{selected.team1} vs {selected.team2}</span>
        </div>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs mb-4">{selected.league}</span>
          <div className="flex items-center justify-center gap-6 my-8">
            <div className="flex-1"><p className="text-white font-bold text-lg">{selected.team1}</p><p className="text-6xl font-bold text-white mt-2">{selected.score1}</p></div>
            <span className="text-zinc-600 font-bold text-xl">VS</span>
            <div className="flex-1"><p className="text-white font-bold text-lg">{selected.team2}</p><p className="text-6xl font-bold text-white mt-2">{selected.score2}</p></div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800">
            <video controls autoPlay className="w-full aspect-video" style={{background:'#000'}}>
              <source src={selected.streamUrl} type="application/x-mpegURL" />
            </video>
          </div>
        </div>
      </div>
    );
  }

  // Main sports page
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 px-4 h-14 flex items-center gap-4">
        <Link to="/" className="text-zinc-400 hover:text-white text-sm flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <span className="text-white font-bold text-sm">⚽ Live Sports</span>
        <span className="ml-auto text-xs text-green-500 font-medium">{live.length} live</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {live.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-red-500" /> Live Now</h2>
            <div className="space-y-2">
              {live.map((m: any) => (
                <div key={m.id} onClick={() => setSelected(m)} className="rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-red-500/30 cursor-pointer p-4 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{m.league}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold"><Activity className="w-2.5 h-2.5 animate-pulse" />{m.timeDesc}'</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm flex-1 text-right">{m.team1}</span>
                    <span className="text-2xl font-bold text-white">{m.score1} - {m.score2}</span>
                    <span className="text-white font-semibold text-sm flex-1">{m.team2}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-800/30 flex items-center justify-center gap-1.5 text-red-500 text-xs font-medium"><Play className="w-3 h-3" fill="currentColor" /> Watch Live</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" /> Upcoming</h2>
            <div className="space-y-2">
              {upcoming.map((m: any) => (
                <div key={m.id} className="rounded-2xl bg-zinc-900 border border-zinc-800/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{m.league}</span>
                    <span className="text-[10px] text-zinc-500">{new Date(m.startTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <div className="flex items-center gap-2"><span className="text-white text-xs flex-1 text-right">{m.team1}</span><span className="text-zinc-600 text-xs">VS</span><span className="text-white text-xs flex-1">{m.team2}</span></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {highlights.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Highlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highlights.slice(0, 6).map((h: any, i: number) => (
                <a key={i} href={h.url} target="_blank" rel="noopener noreferrer" className="rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-red-500/30 transition-all overflow-hidden group">
                  <div className="aspect-video bg-zinc-800 relative">
                    <img src={h.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Play className="w-10 h-10 text-white" fill="white" /></div>
                  </div>
                  <div className="p-3"><p className="text-white text-xs line-clamp-2">{h.title}</p><p className="text-zinc-500 text-[10px] mt-1">{parseInt(h.views).toLocaleString()} views</p></div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
