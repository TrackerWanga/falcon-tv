export interface Channel {
  id: string;
  name: string;
  country: string;
  categories: string[];
  logo?: string;
  url?: string;
  quality?: string;
  hasStream?: boolean;
}

const METADATA_API = 'https://tv-api-gateway.trackerwanga254.workers.dev/v1';
const STREAMS_URL = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/streams_matched.json';
const SPORTS_URL = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data/sports.json';

// Get live stream IDs for quick lookup
let liveIds: Set<string> = new Set();
export async function loadLiveIds(): Promise<Set<string>> {
  try {
    const res = await fetch(STREAMS_URL);
    const data = await res.json();
    liveIds = new Set(Object.keys(data.streams || {}));
    return liveIds;
  } catch { return new Set(); }
}

export function isLive(channelId: string): boolean {
  return liveIds.has(channelId) || [...liveIds].some(id => id.startsWith(channelId));
}

// Search channels from metadata API
export async function searchChannels(query: string): Promise<Channel[]> {
  const res = await fetch(`${METADATA_API}/channels/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return (data.results || []).map((c: any) => ({ ...c, hasStream: isLive(c.id) }));
}

// Get channels by category
export async function getChannelsByCategory(category: string): Promise<Channel[]> {
  const res = await fetch(`${METADATA_API}/channels?category=${category}&limit=999`);
  const data = await res.json();
  return (data.channels || []).map((c: any) => ({ ...c, hasStream: isLive(c.id) }));
}

// Get channels by country
export async function getChannelsByCountry(country: string): Promise<Channel[]> {
  const res = await fetch(`${METADATA_API}/channels?country=${country}&limit=999`);
  const data = await res.json();
  return (data.channels || []).map((c: any) => ({ ...c, hasStream: isLive(c.id) }));
}

// Get stream URL for a channel
export async function getStreamUrl(channelId: string): Promise<string | null> {
  try {
    const res = await fetch(STREAMS_URL);
    const data = await res.json();
    const streams = data.streams || {};
    if (streams[channelId]) return streams[channelId];
    for (const [key, url] of Object.entries(streams)) {
      if (key.startsWith(channelId) || key.toLowerCase() === channelId.toLowerCase()) return url as string;
    }
    return null;
  } catch { return null; }
}

// Get all countries
export async function getCountries(): Promise<string[]> {
  const res = await fetch(`${METADATA_API}/countries`);
  return res.json();
}

// Get sports data
export async function getSports(): Promise<any> {
  const res = await fetch(SPORTS_URL);
  return res.json();
}

// Generate flag from country code
export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  const offset = 127397;
  return String.fromCodePoint(code.toUpperCase().charCodeAt(0) + offset) + String.fromCodePoint(code.toUpperCase().charCodeAt(1) + offset);
}

const NAMES: Record<string, string> = {
  US:'United States',UK:'United Kingdom',CA:'Canada',AU:'Australia',IN:'India',DE:'Germany',FR:'France',JP:'Japan',BR:'Brazil',ES:'Spain',IT:'Italy',MX:'Mexico',KR:'South Korea',AR:'Argentina',ZA:'South Africa',RU:'Russia',CN:'China',KE:'Kenya',NG:'Nigeria',EG:'Egypt',IL:'Israel',AE:'UAE',SA:'Saudi Arabia',PK:'Pakistan',TR:'Turkey',GR:'Greece',CH:'Switzerland',AT:'Austria',BE:'Belgium',IE:'Ireland',NZ:'New Zealand',PH:'Philippines',ID:'Indonesia',MY:'Malaysia',TH:'Thailand',VN:'Vietnam',CO:'Colombia',CL:'Chile',PE:'Peru',VE:'Venezuela',PT:'Portugal',PL:'Poland',NL:'Netherlands',SE:'Sweden',NO:'Norway',DK:'Denmark',FI:'Finland',UA:'Ukraine',
};
export function getCountryName(code: string): string { return NAMES[code] || code; }
