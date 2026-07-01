import {
  DEFAULT_HTML_HEADERS,
  LINKEDIN_AUTHWALL_STATUS,
  LINKEDIN_FETCH_TIMEOUT_MS,
  LINKEDIN_USER_AGENTS,
  PLATFORM_REJECT_URL_PATTERNS,
} from "@/constants";
import { buildPreviewFromHtml } from "@/lib";
import { buildFinalFallback } from "@/fallback";
import type { FetchLinkPreviewOptions, LinkPreviewResponse } from "@/types";

export async function fetchLinkedInPreview(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewResponse> {
  const authwallPatterns = PLATFORM_REJECT_URL_PATTERNS.linkedin ?? [];

  for (const userAgent of LINKEDIN_USER_AGENTS) {
    try {
      const response = await fetch(inputUrl, {
        method: "GET",
        redirect: "follow",
        headers: { ...DEFAULT_HTML_HEADERS, "User-Agent": userAgent },
        signal: AbortSignal.timeout(LINKEDIN_FETCH_TIMEOUT_MS),
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
