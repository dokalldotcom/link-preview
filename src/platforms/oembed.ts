import { BROWSER_USER_AGENT, JSON_ACCEPT_HEADER, OEMBED_TIMEOUT_MS } from "@/constants";
import { pickString } from "@/lib";
import type { LinkPreviewData, OEmbedPayload, PlatformDefaults } from "@/types";

export async function fetchOEmbedJson(
  endpoint: string,
  options?: { referer?: string },
): Promise<OEmbedPayload | null> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: JSON_ACCEPT_HEADER,
        "User-Agent": BROWSER_USER_AGENT,
        ...(options?.referer ? { Referer: options.referer } : {}),
      },
      signal: AbortSignal.timeout(OEMBED_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const text = await response.text();
    if (!text.trim()) return null;

    try {
      return JSON.parse(text) as OEmbedPayload;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

export function buildOEmbedPreview(
  inputUrl: string,
  data: OEmbedPayload,
  defaults: PlatformDefaults,
  map?: (data: OEmbedPayload) => Partial<LinkPreviewData>,
) {
  const mapped = map?.(data) ?? {};
  const title = pickString(mapped.title ?? data.title);
  const image = pickString(mapped.image ?? data.thumbnail_url);
  const description = mapped.description;
  const siteName =
    pickString(mapped.siteName) || pickString(data.provider_name) || defaults.siteName;

  if (!title && !image && !description) return null;

  return {
    url: inputUrl,
    finalUrl: inputUrl,
    title,
    description,
    image,
    siteName,
    type: mapped.type || defaults.type,
    favicon: mapped.favicon || defaults.favicon,
  };
}
