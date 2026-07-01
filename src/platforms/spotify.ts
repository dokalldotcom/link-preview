import { PLATFORM_DEFAULTS, buildSpotifyOEmbedUrl } from "@/constants";
import type { LinkPreviewData } from "@/types";
import { buildOEmbedPreview, fetchOEmbedJson } from "./oembed";

const SPOTIFY_DEFAULTS = PLATFORM_DEFAULTS.spotify;

export async function fetchSpotifyPreview(inputUrl: string): Promise<LinkPreviewData | null> {
  const data = await fetchOEmbedJson(buildSpotifyOEmbedUrl(inputUrl));
  if (!data) return null;

  return buildOEmbedPreview(inputUrl, data, SPOTIFY_DEFAULTS);
}
