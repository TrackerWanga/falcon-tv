export interface Channel {
  id: string;
  name: string;
  country: string;
  categories: string[];
  logo?: string;
  url?: string;
  quality?: string;
  source?: string;
}

const BASE = 'https://tv-api-gateway.trackerwanga254.workers.dev/v1';
const DATA_BASE = 'https://raw.githubusercontent.com/TrackerWanga/tv-stream-api/main/data';

// Get top 100 guaranteed working streams
export async function getTopStreams(): Promise<Channel[]> {
  const res = await fetch(`${DATA_BASE}/api_top100.json`);
  const data = await res.json();
  const streams = data.streams || {};
  return Object.values(streams);
}

// Get streams by country
export async function getStreamsByCountry(country: string): Promise<Channel[]> {
  const res = await fetch(`${DATA_BASE}/api_by_country.json`);
  const data = await res.json();
  const countries = data.countries || {};
  const streams = countries[country] || {};
  return Object.values(streams);
}

// Get streams by category
export async function getStreamsByCategory(category: string): Promise<Channel[]> {
  const res = await fetch(`${DATA_BASE}/api_by_category.json`);
  const data = await res.json();
  const categories = data.categories || {};
  const streams = categories[category] || {};
  return Object.values(streams);
}

// Get ALL working streams (may be large)
export async function getAllStreams(): Promise<Channel[]> {
  const res = await fetch(`${DATA_BASE}/api_streams.json`);
  const data = await res.json();
  const streams = data.streams || {};
  return Object.values(streams);
}

// Search channels (from metadata API, not streams)
export async function searchChannels(query: string): Promise<Channel[]> {
  const res = await fetch(`${BASE}/channels/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  return data.results || [];
}

// Get all countries
export async function getCountries(): Promise<string[]> {
  const res = await fetch(`${BASE}/countries`);
  return res.json();
}

// Generate flag emoji from 2-letter country code
export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  const offset = 127397;
  return String.fromCodePoint(code.toUpperCase().charCodeAt(0) + offset) + 
         String.fromCodePoint(code.toUpperCase().charCodeAt(1) + offset);
}

// Common country names
const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States', UK: 'United Kingdom', CA: 'Canada', AU: 'Australia',
  IN: 'India', DE: 'Germany', FR: 'France', JP: 'Japan', BR: 'Brazil',
  ES: 'Spain', IT: 'Italy', MX: 'Mexico', KR: 'South Korea', AR: 'Argentina',
  ZA: 'South Africa', RU: 'Russia', CN: 'China', KE: 'Kenya', NG: 'Nigeria',
  EG: 'Egypt', IL: 'Israel', AE: 'UAE', SA: 'Saudi Arabia', PK: 'Pakistan',
  TR: 'Turkey', GR: 'Greece', CH: 'Switzerland', AT: 'Austria',
  BE: 'Belgium', IE: 'Ireland', NZ: 'New Zealand', PH: 'Philippines',
  ID: 'Indonesia', MY: 'Malaysia', TH: 'Thailand', VN: 'Vietnam',
  CO: 'Colombia', CL: 'Chile', PE: 'Peru', VE: 'Venezuela',
  PT: 'Portugal', PL: 'Poland', NL: 'Netherlands', SE: 'Sweden',
  NO: 'Norway', DK: 'Denmark', FI: 'Finland', UA: 'Ukraine',
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}
