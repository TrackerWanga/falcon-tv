import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Clock, Trophy, Activity } from 'lucide-react';

const SPORTS_URL = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/sports.json';

interface LiveMatch {
  id: string;
  league: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  status: string;
  timeDesc: string;
  streamUrl: string;
}

interface UpcomingMatch {
  id: string;
  league: string;
  team1: string;
  team2: string;
  startTime: number;
}

interface Highlight {
  title: string;
  url: string;
  cover: string;
  duration: string;
  views: string;
}

export default function Sports() {
  const [live, setLive] = useState<LiveMatch[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingMatch[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<LiveMatch | null>(null);

  useEffect(() => {
    fetch(SPORTS_URL)
      .then(r => r.json())
      .then(d => {
        setLive(d.live || []);
        setUpcoming(d.upcoming || []);
        setHighlights(d.highlights || []);
        setNews(d.news || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-10 h-10 text-red-500 animate-pulse mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Loading sports...</p>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-white font-medium text-sm truncate">{selected.team1} vs {selected.team2}</span>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium border border-red-500/20">
              {selected.league}
            </span>
            {selected.timeDesc && (
              <span className="ml-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {selected.timeDesc}'
              </span>
            )}
          </div>
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center flex-1">
              <p className="text-white font-bold text-base">{selected.team1}</p>
              <p className="text-5xl font-bold text-white mt-2">{selected.score1}</p>
            </div>
            <span className="text-zinc-600 text-lg font-bold">VS</span>
            <div className="text-center flex-1">
              <p className="text-white font-bold text-base">{selected.team2}</p>
              <p className="text-5xl font-bold text-white mt-2">{selected.score2}</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-black border border-zinc-800">
            <video controls autoPlay className="w-full aspect-video" style={{ background: '#000' }}>
              <source src={selected.streamUrl} type="application/x-mpegURL" />
            </video>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <span className="text-white font-bold text-sm">⚽ Live Sports</span>
          <span className="ml-auto text-xs text-green-500 font-medium">{live.length} live</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Live */}
        {live.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" /> Live Now
            </h2>
            <div className="space-y-2">
              {live.map(m => (
                <div key={m.id} onClick={() => setSelected(m)}
                  className="rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-red-500/30 transition-all cursor-pointer p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{m.league}</span>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                      <Activity className="w-2.5 h-2.5 animate-pulse" />{m.timeDesc}'
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold text-sm flex-1 text-right">{m.team1}</span>
                    <span className="text-2xl font-bold text-white">{m.score1} - {m.score2}</span>
                    <span className="text-white font-semibold text-sm flex-1">{m.team2}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-zinc-800/30 flex items-center justify-center gap-1.5 text-red-500 text-xs font-medium">
                    <Play className="w-3 h-3" fill="currentColor" /> Watch Live
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" /> Upcoming
            </h2>
            <div className="space-y-2">
              {upcoming.map(m => (
                <div key={m.id} className="rounded-2xl bg-zinc-900 border border-zinc-800/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">{m.league}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs flex-1 text-right">{m.team1}</span>
                    <span className="text-zinc-600 text-xs">VS</span>
                    <span className="text-white text-xs flex-1">{m.team2}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highlights.slice(0, 6).map((h, i) => (
                <a key={i} href={h.url} target="_blank" rel="noopener noreferrer"
                  className="rounded-2xl bg-zinc-900 border border-zinc-800/50 hover:border-red-500/30 transition-all overflow-hidden group">
                  <div className="aspect-video bg-zinc-800 relative">
                    <img src={h.cover} alt="" className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-10 h-10 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs line-clamp-2">{h.title}</p>
                    <p className="text-zinc-500 text-[10px] mt-1">{parseInt(h.views).toLocaleString()} views</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
