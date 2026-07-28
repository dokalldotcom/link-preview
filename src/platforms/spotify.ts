import { PLATFORM_DEFAULTS, buildSpotifyOEmbedUrl } from "@/constants";
import type { FetchLinkPreviewOptions, LinkPreviewData } from "@/types";
import { buildOEmbedPreview, fetchOEmbedJson } from "./oembed";

const SPOTIFY_DEFAULTS = PLATFORM_DEFAULTS.spotify;

export async function fetchSpotifyPreview(
  inputUrl: string,
  options?: FetchLinkPreviewOptions,
): Promise<LinkPreviewData | null> {
  const data = await fetchOEmbedJson(buildSpotifyOEmbedUrl(inputUrl), options);
  if (!data) return null;

  return buildOEmbedPreview(inputUrl, data, SPOTIFY_DEFAULTS);
}
