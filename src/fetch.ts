import {
  isFacebookUrl,
  isInstagramUrl,
  isJunkFacebookPreview,
  isJunkInstagramPreview,
  isJunkThreadsPreview,
  isJunkTikTokPreview,
  isLinkedInUrl,
  isThreadsUrl,
  isTikTokUrl,
  validateLinkPreview,
} from "@/lib";
import { shouldUsePlatforms } from "@/options";
import { fetchDirectPreviewWithCrawlers } from "./crawler";
import { buildFinalFallback } from "./fallback";
import {
  fetchFacebookPreview,
  fetchInstagramPreview,
  fetchLinkedInPreview,
  fetchThreadsPreview,
  fetchTikTokPreview,
  tryDedicatedPlatformPreview,
} from "./platforms";
import type { FetchLinkPreviewOptions, LinkPreviewResponse } from "@/types";

async function resolveJunkDirectPreview(
  url: string,
  preview: NonNullable<LinkPreviewResponse["preview"]>,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse | null> {
  if (!shouldUsePlatforms(options)) return null;

  if (isTikTokUrl(url) && isJunkTikTokPreview(preview, preview.finalUrl)) {
    const tiktok = await fetchTikTokPreview(url, options);
    if (tiktok) return { ok: true, preview: tiktok };
    return buildFinalFallback(url, options);
  }

  if (isInstagramUrl(url) && isJunkInstagramPreview(preview)) {
    const instagram = await fetchInstagramPreview(url, options);
    if (instagram) return { ok: true, preview: instagram };
    return buildFinalFallback(url, options);
  }

  if (isThreadsUrl(url) && isJunkThreadsPreview(preview)) {
    const threads = await fetchThreadsPreview(url, options);
    if (threads) return { ok: true, preview: threads };
    return buildFinalFallback(url, options);
  }

  if (isFacebookUrl(url) && isJunkFacebookPreview(preview, preview.finalUrl)) {
    return fetchFacebookPreview(url, options);
  }

  return null;
}

/** Fetch link preview metadata (Open Graph + platform oEmbed). */
export async function getLinkPreview(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse> {
  const validation = validateLinkPreview(inputUrl);
  if (!validation.ok) {
    return { ok: false, message: validation.error };
  }

  const url = validation.url;
  const usePlatforms = shouldUsePlatforms(options);

  if (usePlatforms && isFacebookUrl(url)) {
    return fetchFacebookPreview(url, options);
  }

  if (usePlatforms) {
    const dedicated = await tryDedicatedPlatformPreview(url, options);
    if (dedicated) {
      return { ok: true, preview: dedicated };
    }
  }

  if (usePlatforms && isLinkedInUrl(url)) {
    return fetchLinkedInPreview(url, options);
  }

  try {
    const direct = await fetchDirectPreviewWithCrawlers(url, options);
    if (direct?.ok && direct.preview) {
      const refined = await resolveJunkDirectPreview(url, direct.preview, options);
      return refined ?? direct;
    }

    if (usePlatforms) {
      const platform = await tryDedicatedPlatformPreview(url, options);
      if (platform) return { ok: true, preview: platform };
    }

    return buildFinalFallback(url, options);
  } catch {
    if (usePlatforms) {
      const platform = await tryDedicatedPlatformPreview(url, options);
      if (platform) return { ok: true, preview: platform };
    }

    return buildFinalFallback(url, options);
  }
}

/** @deprecated Use {@link getLinkPreview} */
export const fetchLinkPreviewDirectOnly = getLinkPreview;
