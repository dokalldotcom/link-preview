import {
  PLATFORM_DEFAULTS,
  PLATFORM_REJECT_URL_PATTERNS,
  TIKTOK_OEMBED_REFERER,
  buildTikTokOEmbedUrl,
} from "@/constants";
import { isJunkTikTokPreview, pickString } from "@/lib";
import type { LinkPreviewData } from "@/types";
import { fetchOEmbedJson } from "./oembed";
import { fetchMetaCrawlerPreview } from "./meta-crawler";

const TIKTOK_DEFAULTS = PLATFORM_DEFAULTS.tiktok;

async function fetchTikTokOEmbedPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const data = await fetchOEmbedJson(buildTikTokOEmbedUrl(inputUrl), {
    referer: TIKTOK_OEMBED_REFERER,
  });
  if (!data) return null;

  const title = pickString(data.title);
  const author = pickString(data.author_name);
  const image = pickString(data.thumbnail_url);

  if (!title && !author && !image) return null;

  return {
    url: inputUrl,
    finalUrl: inputUrl,
    title: title || (author ? `${author} on TikTok` : undefined),
    description: author && title ? author : undefined,
    image,
    siteName: pickString(data.provider_name) || TIKTOK_DEFAULTS.siteName,
    type: TIKTOK_DEFAULTS.type,
    favicon: TIKTOK_DEFAULTS.favicon,
  };
}

async function fetchTikTokHtmlPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const rejectPatterns = PLATFORM_REJECT_URL_PATTERNS.tiktok ?? [];

  return fetchMetaCrawlerPreview(inputUrl, {
    rejectFinalUrl: (url) =>
      rejectPatterns.some((pattern) => url.toLowerCase().includes(pattern)),
    isJunk: isJunkTikTokPreview,
    siteName: TIKTOK_DEFAULTS.siteName,
    favicon: TIKTOK_DEFAULTS.favicon,
    type: TIKTOK_DEFAULTS.type,
  });
}

export async function fetchTikTokPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  return (await fetchTikTokOEmbedPreview(inputUrl)) ?? fetchTikTokHtmlPreview(inputUrl);
}
