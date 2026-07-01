import { PLATFORM_DEFAULTS, PLATFORM_REJECT_URL_PATTERNS } from "@/constants";
import { isJunkInstagramPreview, isJunkThreadsPreview } from "@/lib";
import type { LinkPreviewData } from "@/types";
import { fetchMetaCrawlerPreview } from "./meta-crawler";

const INSTAGRAM_DEFAULTS = PLATFORM_DEFAULTS.instagram;
const THREADS_DEFAULTS = PLATFORM_DEFAULTS.threads;

export async function fetchInstagramPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  return fetchMetaCrawlerPreview(inputUrl, {
    rejectSubstrings: [...(PLATFORM_REJECT_URL_PATTERNS.instagram ?? [])],
    isJunk: isJunkInstagramPreview,
    siteName: INSTAGRAM_DEFAULTS.siteName,
    favicon: INSTAGRAM_DEFAULTS.favicon,
  });
}

export async function fetchThreadsPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  return fetchMetaCrawlerPreview(inputUrl, {
    rejectSubstrings: [...(PLATFORM_REJECT_URL_PATTERNS.threads ?? [])],
    isJunk: isJunkThreadsPreview,
    siteName: THREADS_DEFAULTS.siteName,
    favicon: THREADS_DEFAULTS.favicon,
  });
}
