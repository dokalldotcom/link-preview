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
  validateDirectPreviewUrl,
} from "@/lib";
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
  if (isTikTokUrl(url) && isJunkTikTokPreview(preview, preview.finalUrl)) {
    const tiktok = await fetchTikTokPreview(url);
    if (tiktok) return { ok: true, preview: tiktok };
    return buildFinalFallback(url, options);
  }

  if (isInstagramUrl(url) && isJunkInstagramPreview(preview)) {
    const instagram = await fetchInstagramPreview(url);
    if (instagram) return { ok: true, preview: instagram };
    return buildFinalFallback(url, options);
  }

  if (isThreadsUrl(url) && isJunkThreadsPreview(preview)) {
    const threads = await fetchThreadsPreview(url);
    if (threads) return { ok: true, preview: threads };
    return buildFinalFallback(url, options);
  }

  if (isFacebookUrl(url) && isJunkFacebookPreview(preview, preview.finalUrl)) {
    return fetchFacebookPreview(url);
  }

  return null;
}

/** Direct unfurl with platform oEmbed fallback. */
export async function fetchLinkPreviewDirectOnly(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse> {
  const validation = validateDirectPreviewUrl(inputUrl);
  if (!validation.ok) {
    return { ok: false, message: validation.error };
  }

  const url = validation.url;

  if (isFacebookUrl(url)) {
    return fetchFacebookPreview(url);
  }

  const dedicated = await tryDedicatedPlatformPreview(url);
  if (dedicated) {
    return { ok: true, preview: dedicated };
  }

  if (isLinkedInUrl(url)) {
    return fetchLinkedInPreview(url, options);
  }

  try {
    const direct = await fetchDirectPreviewWithCrawlers(url);
    if (direct?.ok && direct.preview) {
      const refined = await resolveJunkDirectPreview(url, direct.preview, options);
      return refined ?? direct;
    }

    const platform = await tryDedicatedPlatformPreview(url);
    if (platform) return { ok: true, preview: platform };

    return buildFinalFallback(url, options);
  } catch {
    const platform = await tryDedicatedPlatformPreview(url);
    if (platform) return { ok: true, preview: platform };

    return buildFinalFallback(url, options);
  }
}
