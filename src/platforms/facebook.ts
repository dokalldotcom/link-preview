import {
  FACEBOOK_FETCH_TIMEOUT_MS,
  FACEBOOK_HTML_READ_BYTES,
  FACEBOOK_LETTER_USER_AGENTS,
  FACEBOOK_RANDOM_LETTER_COUNT,
  META_DESCRIPTION_KEYS,
  META_FACEBOOK_IMAGE_KEYS,
  META_KEYS,
  META_TITLE_KEYS,
  PLATFORM_DEFAULTS,
  PLATFORM_REJECT_URL_PATTERNS,
  POSTMAN_FETCH_HEADERS,
} from "@/constants";
import { buildUrlOnlyPreview } from "@/fallback";
import {
  decodeHtmlEntities,
  extractAllMetaContent,
  extractCanonicalUrl,
  extractMetaContent,
  isJunkFacebookPreview,
  pickFacebookPreviewImage,
  readHtmlResponse,
  resolveMaybeRelativeUrl,
  shuffle,
} from "@/lib";
import type { LinkPreviewData, LinkPreviewResponse } from "@/types";
import { acceptHeaderForUserAgent } from "@/user-agents";

const FACEBOOK_DEFAULTS = PLATFORM_DEFAULTS.facebook;

function extractTitleTag(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return undefined;
  return decodeHtmlEntities(match[1].replace(/\s+/g, " "));
}

function buildFacebookPreviewFromHtml(
  inputUrl: string,
  finalUrl: string,
  html: string,
): LinkPreviewData | null {
  const title =
    extractMetaContent(html, [...META_TITLE_KEYS]) || extractTitleTag(html);
  const description = extractMetaContent(html, [...META_DESCRIPTION_KEYS]);
  const image = pickFacebookPreviewImage(
    ...extractAllMetaContent(html, [...META_FACEBOOK_IMAGE_KEYS]),
  );
  const resolvedFinalUrl =
    extractMetaContent(html, [META_KEYS.OG_URL]) || extractCanonicalUrl(html, finalUrl) || finalUrl;
  const type = extractMetaContent(html, [META_KEYS.OG_TYPE]);

  const preview: LinkPreviewData = {
    url: inputUrl,
    finalUrl: resolveMaybeRelativeUrl(resolvedFinalUrl, finalUrl) || finalUrl,
    title,
    description,
    image: image ? resolveMaybeRelativeUrl(image, finalUrl) : undefined,
    siteName: FACEBOOK_DEFAULTS.siteName,
    type: type || FACEBOOK_DEFAULTS.type,
    favicon: FACEBOOK_DEFAULTS.favicon,
  };

  if (isJunkFacebookPreview(preview, preview.finalUrl)) return null;
  if (!title && !description && !image) return null;

  return preview;
}

function headersForFacebookUserAgent(userAgent: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: acceptHeaderForUserAgent(userAgent),
    "User-Agent": userAgent,
  };

  if (acceptHeaderForUserAgent(userAgent) !== "*/*") {
    headers["Accept-Language"] = "en-US,en;q=0.9,vi;q=0.8";
    headers["Cache-Control"] = "no-cache";
  }

  return headers;
}

function buildFacebookUserAgentOrder(): string[] {
  const postman = POSTMAN_FETCH_HEADERS["User-Agent"];
  const letters = shuffle(FACEBOOK_LETTER_USER_AGENTS).slice(0, FACEBOOK_RANDOM_LETTER_COUNT);
  return [postman, ...letters, postman];
}

function isFacebookLoginUrl(url: string) {
  const patterns = PLATFORM_REJECT_URL_PATTERNS.facebook ?? [];
  return patterns.some((pattern) => url.toLowerCase().includes(pattern));
}

async function fetchFacebookDirectPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  for (const userAgent of buildFacebookUserAgentOrder()) {
    try {
      const response = await fetch(inputUrl, {
        method: "GET",
        redirect: "follow",
        headers: headersForFacebookUserAgent(userAgent),
        signal: AbortSignal.timeout(FACEBOOK_FETCH_TIMEOUT_MS),
      });

      if (!response.ok || isFacebookLoginUrl(response.url)) continue;

      const html = await readHtmlResponse(response, FACEBOOK_HTML_READ_BYTES);
      if (!html) continue;

      const preview = buildFacebookPreviewFromHtml(inputUrl, response.url || inputUrl, html);
      if (preview) return preview;
    } catch {
      continue;
    }
  }

  return null;
}

export async function fetchFacebookPreview(inputUrl: string): Promise<LinkPreviewResponse> {
  const direct = await fetchFacebookDirectPreview(inputUrl);
  if (direct) {
    return { ok: true, preview: direct };
  }

  return buildUrlOnlyPreview(inputUrl);
}
