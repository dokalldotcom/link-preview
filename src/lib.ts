import {
  ALLOWED_URL_PROTOCOLS,
  BLOCKED_HOSTNAME_SUFFIXES,
  BLOCKED_HOSTNAMES,
  CLOUDFLARE_BLOCKED_STATUS_CODES,
  CLOUDFLARE_CHALLENGE_VALUE,
  CLOUDFLARE_HTML_MARKERS,
  CLOUDFLARE_JUNK_TITLE_PATTERN,
  CLOUDFLARE_MITIGATED_HEADER,
  CLOUDFLARE_SERVER_HEADER,
  CLOUDFLARE_SMALL_HTML_THRESHOLD,
  ERROR_MESSAGES,
  FACEBOOK_FBCDN_PATTERN,
  FACEBOOK_SCONTENT_PATTERN,
  FACEBOOK_UNUSABLE_IMAGE_HOST,
  JUNK_PREVIEW_TITLES,
  JUNK_TIKTOK_DESCRIPTION,
  MAX_HTML_BYTES,
  META_DESCRIPTION_KEYS,
  META_IMAGE_KEYS,
  META_KEYS,
  META_SITE_NAME_KEYS,
  META_TITLE_KEYS,
  PLATFORM_HOSTS,
  PLATFORM_REJECT_URL_PATTERNS,
} from "@/constants";
import type { LinkPreviewData, LinkPreviewResponse, ValidateDirectPreviewUrlResult } from "@/types";

// --- strings / urls ---

export function pickString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

export function shuffle<T>(items: readonly T[]) {
  const shuffled = [...new Set(items)];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

export function stripHtmlTags(html: string) {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function resolveMaybeRelativeUrl(value: string | undefined, baseUrl: string) {
  if (!value) return undefined;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

export function concatBytes(chunks: Uint8Array[], total: number) {
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

// --- host matchers ---

function parseHost(inputUrl: string) {
  try {
    return new URL(inputUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function normalizedHost(inputUrl: string) {
  const host = parseHost(inputUrl);
  return host?.replace(/^www\./, "") ?? null;
}

function hostMatches(inputUrl: string, hosts: readonly string[]) {
  const host = normalizedHost(inputUrl);
  if (!host) return false;
  return hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
}

export function isYoutubeUrl(inputUrl: string) {
  const host = parseHost(inputUrl);
  const [shortHost, mainHost] = PLATFORM_HOSTS.youtube;
  return Boolean(host && (host === shortHost || host.includes(mainHost)));
}

export function isTikTokUrl(inputUrl: string) {
  return hostMatches(inputUrl, PLATFORM_HOSTS.tiktok);
}

export function isInstagramUrl(inputUrl: string) {
  return hostMatches(inputUrl, PLATFORM_HOSTS.instagram);
}

export function isThreadsUrl(inputUrl: string) {
  return hostMatches(inputUrl, PLATFORM_HOSTS.threads);
}

export function isFacebookUrl(inputUrl: string) {
  const host = parseHost(inputUrl);
  return Boolean(
    host &&
      PLATFORM_HOSTS.facebook.some(
        (candidate) => host === candidate || host.includes(candidate),
      ),
  );
}

export function isRedditUrl(inputUrl: string) {
  return hostMatches(inputUrl, PLATFORM_HOSTS.reddit);
}

export function isSpotifyUrl(inputUrl: string) {
  return hostMatches(inputUrl, PLATFORM_HOSTS.spotify);
}

export function isLinkedInUrl(inputUrl: string) {
  const host = parseHost(inputUrl);
  return Boolean(host?.includes(PLATFORM_HOSTS.linkedin[0]));
}

export function isXUrl(inputUrl: string) {
  const host = normalizedHost(inputUrl);
  if (!host) return false;
  const [xHost, twitterHost] = PLATFORM_HOSTS.x;
  return host === xHost || host === twitterHost || host.endsWith(`.${twitterHost}`);
}

export function isChatGptUrl(inputUrl: string) {
  return hostMatches(inputUrl, PLATFORM_HOSTS.chatgpt);
}

export function xTweetId(inputUrl: string) {
  try {
    return new URL(inputUrl).pathname.match(/\/status\/(\d+)/)?.[1];
  } catch {
    return undefined;
  }
}

// --- junk preview filters ---

function finalUrlIncludesPattern(finalUrl: string | undefined, patterns: readonly string[]) {
  const resolved = (finalUrl || "").toLowerCase();
  return patterns.some((pattern) => resolved.includes(pattern));
}

export function isJunkFacebookPreview(preview: LinkPreviewData, finalUrl?: string) {
  if (finalUrlIncludesPattern(finalUrl || preview.finalUrl, PLATFORM_REJECT_URL_PATTERNS.facebook!)) {
    return true;
  }
  if (
    preview.title === JUNK_PREVIEW_TITLES.FACEBOOK &&
    !preview.image &&
    !preview.description
  ) {
    return true;
  }
  return false;
}

export function isJunkTikTokPreview(preview: LinkPreviewData, finalUrl?: string) {
  if (finalUrlIncludesPattern(finalUrl || preview.finalUrl, PLATFORM_REJECT_URL_PATTERNS.tiktok!)) {
    return true;
  }
  if (
    preview.title === JUNK_PREVIEW_TITLES.TIKTOK &&
    preview.description === JUNK_TIKTOK_DESCRIPTION
  ) {
    return true;
  }
  if (preview.title === JUNK_PREVIEW_TITLES.TIKTOK && !preview.image) return true;
  return false;
}

export function isJunkInstagramPreview(preview: LinkPreviewData) {
  return (
    preview.title === JUNK_PREVIEW_TITLES.INSTAGRAM &&
    !preview.image &&
    !preview.description
  );
}

export function isJunkThreadsPreview(preview: LinkPreviewData) {
  return (
    preview.title === JUNK_PREVIEW_TITLES.THREADS && !preview.image && !preview.description
  );
}

export function isJunkCloudflarePreview(preview: LinkPreviewData) {
  const title = (preview.title || "").toLowerCase();
  const description = (preview.description || "").toLowerCase();

  if (CLOUDFLARE_JUNK_TITLE_PATTERN.test(title)) {
    return true;
  }

  if (title.includes(CLOUDFLARE_SERVER_HEADER) && !preview.image) return true;
  if (
    description.includes(CLOUDFLARE_SERVER_HEADER) &&
    !preview.image &&
    !preview.title
  ) {
    return true;
  }

  return false;
}

export function isCloudflareBlocked(response: Response, html?: string) {
  if (response.headers.get(CLOUDFLARE_MITIGATED_HEADER) === CLOUDFLARE_CHALLENGE_VALUE) {
    return true;
  }

  const server = (response.headers.get("server") || "").toLowerCase();
  if (
    CLOUDFLARE_BLOCKED_STATUS_CODES.includes(response.status as 403 | 503) &&
    server.includes(CLOUDFLARE_SERVER_HEADER)
  ) {
    return true;
  }

  if (!html) return false;
  if (html.includes(CLOUDFLARE_HTML_MARKERS.BROWSER_VERIFICATION)) return true;
  if (
    CLOUDFLARE_HTML_MARKERS.JUST_A_MOMENT.test(html) &&
    html.includes(CLOUDFLARE_HTML_MARKERS.CHALLENGE_PLATFORM)
  ) {
    return true;
  }
  if (
    CLOUDFLARE_HTML_MARKERS.CHECKING_BROWSER.test(html) &&
    html.length < CLOUDFLARE_SMALL_HTML_THRESHOLD
  ) {
    return true;
  }

  return false;
}

// --- facebook images ---

function isUnusableFacebookImageUrl(image: string | undefined) {
  if (!image) return false;
  try {
    const host = new URL(image).hostname.toLowerCase();
    return (
      host === FACEBOOK_UNUSABLE_IMAGE_HOST ||
      host.endsWith(`.${FACEBOOK_UNUSABLE_IMAGE_HOST}`)
    );
  } catch {
    return false;
  }
}

function normalizeFacebookImageUrl(image: string | undefined) {
  if (!image) return undefined;
  return image.replace(/&amp;/g, "&").trim() || undefined;
}

export function pickFacebookPreviewImage(...candidates: (string | undefined)[]) {
  const normalized = candidates
    .map((candidate) => normalizeFacebookImageUrl(candidate))
    .filter((candidate): candidate is string => Boolean(candidate));

  const scontent = normalized.find(
    (image) => FACEBOOK_SCONTENT_PATTERN.test(image) && FACEBOOK_FBCDN_PATTERN.test(image),
  );
  if (scontent && !isUnusableFacebookImageUrl(scontent)) return scontent;

  return normalized.find((image) => !isUnusableFacebookImageUrl(image));
}

// --- url validation (SSRF guard) ---

function isPrivateIpv4(host: string) {
  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIpv6(host: string) {
  const normalized = host.toLowerCase();
  if (normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe80")) return true;
  return false;
}

export function assertSafeTargetUrl(rawUrl: string) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(ERROR_MESSAGES.INVALID_URL);
  }

  if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol as (typeof ALLOWED_URL_PROTOCOLS)[number])) {
    throw new Error(ERROR_MESSAGES.ONLY_HTTP_HTTPS);
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");

  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error(ERROR_MESSAGES.URL_NOT_ALLOWED);
  }

  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    throw new Error(ERROR_MESSAGES.INTERNAL_HOSTNAMES);
  }

  if (isPrivateIpv4(hostname) || isPrivateIpv6(hostname)) {
    throw new Error(ERROR_MESSAGES.PRIVATE_NETWORK);
  }

  return parsed.href;
}

export function validateDirectPreviewUrl(input: string): ValidateDirectPreviewUrlResult {
  try {
    const url = assertSafeTargetUrl(input.trim());
    return { ok: true, url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : ERROR_MESSAGES.INVALID_URL,
    };
  }
}

// --- html / og parsing ---

function escapeMetaProperty(value: string) {
  return value.replace(/[\\^$*+?()|[\]{}]/g, "\\$&");
}

export function extractMetaContent(html: string, keys: string[]) {
  for (const key of keys) {
    const values = extractAllMetaContent(html, [key]);
    if (values[0]) return values[0];
  }
  return undefined;
}

export function extractAllMetaContent(html: string, keys: string[]) {
  const values: string[] = [];

  for (const key of keys) {
    const escaped = escapeMetaProperty(key);
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`,
        "gi",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`,
        "gi",
      ),
      new RegExp(
        `<meta[^>]+(?:property|name=['"])${escaped}['"][^>]+content=['"]([^'"]*)['"]`,
        "gi",
      ),
    ];

    for (const pattern of patterns) {
      for (const match of html.matchAll(pattern)) {
        const value = decodeHtmlEntities(match[1]);
        if (value) values.push(value);
      }
    }
  }

  return values;
}

function extractTitleTag(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return undefined;
  return decodeHtmlEntities(match[1].replace(/\s+/g, " "));
}

function extractFavicon(html: string, baseUrl: string) {
  const iconMatch =
    html.match(/<link[^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut icon|icon|apple-touch-icon)["']/i);

  if (!iconMatch?.[1]) return undefined;

  try {
    return new URL(iconMatch[1], baseUrl).toString();
  } catch {
    return undefined;
  }
}

export function extractCanonicalUrl(html: string, baseUrl: string) {
  const match =
    html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);

  if (!match?.[1]) return undefined;
  return resolveMaybeRelativeUrl(decodeHtmlEntities(match[1]), baseUrl);
}

export function buildPreviewFromHtml(
  inputUrl: string,
  response: Response,
  html: string,
): LinkPreviewResponse {
  const finalUrl = response.url || inputUrl;
  const title = extractMetaContent(html, [...META_TITLE_KEYS]) || extractTitleTag(html);
  const description = extractMetaContent(html, [...META_DESCRIPTION_KEYS]);
  const image = resolveMaybeRelativeUrl(
    extractMetaContent(html, [...META_IMAGE_KEYS]),
    finalUrl,
  );
  const siteName = extractMetaContent(html, [...META_SITE_NAME_KEYS]);
  const type = extractMetaContent(html, [META_KEYS.OG_TYPE]);
  const favicon = extractFavicon(html, finalUrl);

  if (!title && !description && !image) {
    return {
      ok: false,
      message: ERROR_MESSAGES.NO_PREVIEW_METADATA,
    };
  }

  return {
    ok: true,
    preview: { url: inputUrl, finalUrl, title, description, image, siteName, type, favicon },
  };
}

export function previewDataFromHtml(
  inputUrl: string,
  finalUrl: string,
  html: string,
  overrides?: Partial<LinkPreviewData>,
): LinkPreviewData | null {
  const fakeResponse = { url: finalUrl } as Response;
  const built = buildPreviewFromHtml(inputUrl, fakeResponse, html);
  if (!built.ok || !built.preview) return null;
  return { ...built.preview, ...overrides };
}

export async function readHtmlResponse(response: Response, maxBytes = MAX_HTML_BYTES) {
  const reader = response.body?.getReader();
  if (!reader) return null;

  const chunks: Uint8Array[] = [];
  let total = 0;

  while (total < maxBytes) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    total += value.length;
  }

  reader.cancel().catch(() => undefined);

  return new TextDecoder("utf-8", { fatal: false }).decode(
    chunks.length === 1 ? chunks[0] : concatBytes(chunks, total),
  );
}
