import { OEMBED_TIMEOUT_MS } from "@/constants";
import { fetchHtmlWithBot } from "@/crawler";
import { buildPreviewFromHtml } from "@/lib";
import type { FetchLinkPreviewOptions, LinkPreviewData, MetaCrawlerConfig } from "@/types";

export async function fetchMetaCrawlerPreview(
  inputUrl: string,
  config: MetaCrawlerConfig,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewData | null> {
  const fetched = await fetchHtmlWithBot(inputUrl, {
    ...options,
    timeoutMs: options?.timeoutMs ?? config.timeoutMs ?? OEMBED_TIMEOUT_MS,
    rejectSubstrings: config.rejectSubstrings,
    rejectFinalUrl: config.rejectFinalUrl,
  });

  if (!fetched) return null;

  const built = buildPreviewFromHtml(inputUrl, fetched.response, fetched.html);
  if (!built.ok || !built.preview) return null;
  if (config.isJunk(built.preview, fetched.response.url)) return null;

  return {
    ...built.preview,
    siteName: built.preview.siteName || config.siteName,
    type: built.preview.type || config.type || "article",
    favicon: built.preview.favicon || config.favicon,
  };
}
