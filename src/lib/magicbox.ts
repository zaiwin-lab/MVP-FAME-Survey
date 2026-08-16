import type { AssetPlatform, DetectedAsset } from '../types';

const PLATFORM_LABELS: Record<AssetPlatform, string> = {
  website: 'Website',
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  google_business: 'Google Business Profile',
  shopee: 'Shopee',
  lazada: 'Lazada',
  grabfood: 'GrabFood',
  foodpanda: 'Foodpanda',
  whatsapp: 'WhatsApp Business',
  directory: 'Business directory',
  other: 'Other public link',
};

export function platformLabel(p: AssetPlatform): string {
  return PLATFORM_LABELS[p];
}

/** Channels a customer can realistically discover the business through. */
export const DISCOVERY_PLATFORMS: AssetPlatform[] = [
  'website',
  'google_business',
  'facebook',
  'instagram',
];

const HOST_RULES: [RegExp, AssetPlatform][] = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)fb\.me$/, 'facebook'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'youtube'],
  [/(^|\.)g\.page$|(^|\.)maps\.app\.goo\.gl$/, 'google_business'],
  [/(^|\.)google\.com$/, 'google_business'],
  [/(^|\.)shopee\.[a-z.]+$/, 'shopee'],
  [/(^|\.)lazada\.[a-z.]+$/, 'lazada'],
  [/(^|\.)grab\.com$/, 'grabfood'],
  [/(^|\.)foodpanda\.[a-z.]+$/, 'foodpanda'],
  [/(^|\.)wa\.me$|(^|\.)whatsapp\.com$/, 'whatsapp'],
  [/(^|\.)yellowpages\.[a-z.]+$|(^|\.)bizdirectory\.[a-z.]+$/, 'directory'],
];

function classify(url: URL): AssetPlatform {
  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (host === 'google.com' && !url.pathname.startsWith('/maps')) return 'other';
  for (const [re, platform] of HOST_RULES) {
    if (re.test(host)) return platform;
  }
  return 'website';
}

/** Strips tracking parameters and trailing slashes so duplicates collapse. */
function normalise(url: URL): string {
  const drop = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid',
    'mibextid',
    'igsh',
    'si',
  ];
  drop.forEach((k) => url.searchParams.delete(k));
  url.hash = '';
  url.hostname = url.hostname.replace(/^www\./, '').toLowerCase();
  url.protocol = 'https:';
  let out = url.toString();
  if (out.endsWith('/')) out = out.slice(0, -1);
  return out;
}

function titleFor(platform: AssetPlatform, url: URL): string {
  const segments = url.pathname.split('/').filter(Boolean);
  const handle = segments[segments.length - 1] ?? '';
  if (platform === 'website') return url.hostname.replace(/^www\./, '');
  if (handle) return `${PLATFORM_LABELS[platform]} · ${decodeURIComponent(handle).slice(0, 40)}`;
  return PLATFORM_LABELS[platform];
}

const URL_RE = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,;<>"')\]]*)?)/gi;
const HANDLE_RE = /(^|\s)@([a-z0-9._-]{2,30})\b/gi;

/**
 * Pulls links and social handles out of free-form pasted text.
 * A bare @handle has no platform, so it is recorded as `other` and the
 * respondent is asked to confirm where it lives.
 */
export function extractAssets(input: string): DetectedAsset[] {
  const found = new Map<string, DetectedAsset>();

  for (const match of input.matchAll(URL_RE)) {
    const raw = match[1];
    // Skip bare email domains and version-like strings.
    if (/@/.test(input.slice(Math.max(0, match.index - 1), match.index))) continue;
    let url: URL;
    try {
      url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    } catch {
      continue;
    }
    if (!url.hostname.includes('.')) continue;
    const platform = classify(url);
    const key = normalise(url);
    if (found.has(key)) continue;
    found.set(key, {
      id: key,
      platform,
      label: titleFor(platform, url),
      raw,
      url: key,
      verification: 'declared',
    });
  }

  for (const match of input.matchAll(HANDLE_RE)) {
    const handle = match[2].toLowerCase();
    const key = `handle:${handle}`;
    if (found.has(key)) continue;
    // A handle already covered by a detected profile URL is not a new asset.
    const covered = [...found.values()].some((a) => a.url.toLowerCase().includes(`/${handle}`));
    if (covered) continue;
    found.set(key, {
      id: key,
      platform: 'other',
      label: `@${handle}`,
      raw: `@${handle}`,
      url: `@${handle}`,
      verification: 'declared',
    });
  }

  return [...found.values()];
}

export function mergeAssets(existing: DetectedAsset[], incoming: DetectedAsset[]): DetectedAsset[] {
  const map = new Map(existing.map((a) => [a.id, a]));
  incoming.forEach((a) => {
    if (!map.has(a.id)) map.set(a.id, a);
  });
  return [...map.values()];
}
