import {
  DEFAULT_HTML_HEADERS,
  LINKEDIN_AUTHWALL_STATUS,
  LINKEDIN_FETCH_TIMEOUT_MS,
  LINKEDIN_USER_AGENTS,
  PLATFORM_REJECT_URL_PATTERNS,
} from "@/constants";
import { buildPreviewFromHtml } from "@/lib";
import { resolveFetch, resolveHeaders, resolveSignal, resolveUserAgent } from "@/options";
import { buildFinalFallback } from "@/fallback";
import type { FetchLinkPreviewOptions, LinkPreviewResponse } from "@/types";

export async function fetchLinkedInPreview(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse> {
  const authwallPatterns = PLATFORM_REJECT_URL_PATTERNS.linkedin ?? [];
  const pinned = resolveUserAgent(options);
  const agents = pinned ? [pinned] : LINKEDIN_USER_AGENTS;

  for (const userAgent of agents) {
    try {
      const response = await resolveFetch(options)(inputUrl, {
        method: "GET",
        redirect: "follow",
        headers: resolveHeaders(
          { ...DEFAULT_HTML_HEADERS, "User-Agent": userAgent },
          options,
        ),
        signal: resolveSignal(options, LINKEDIN_FETCH_TIMEOUT_MS),
      });

      if (response.status === LINKEDIN_AUTHWALL_STATUS) continue;

      const html = await response.text();
      if (!html || authwallPatterns.some((pattern) => html.includes(pattern))) continue;

      const preview = buildPreviewFromHtml(inputUrl, response, html);
      if (preview.ok) return preview;
    } catch {
      continue;
    }
  }

  return buildFinalFallback(inputUrl, options);
}
