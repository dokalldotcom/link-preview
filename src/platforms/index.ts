import {
  isInstagramUrl,
  isRedditUrl,
  isSpotifyUrl,
  isThreadsUrl,
  isTikTokUrl,
  isXUrl,
  isYoutubeUrl,
} from "@/lib";
import type { LinkPreviewData } from "@/types";
import { fetchInstagramPreview, fetchThreadsPreview } from "./instagram";
import { fetchRedditPreview } from "./reddit";
import { fetchSpotifyPreview } from "./spotify";
import { fetchTikTokPreview } from "./tiktok";
import { fetchXPreview } from "./x";
import { fetchYoutubePreview } from "./youtube";

export async function tryDedicatedPlatformPreview(
  inputUrl: string,
): Promise<LinkPreviewData | null> {
  if (isXUrl(inputUrl)) return fetchXPreview(inputUrl);
  if (isYoutubeUrl(inputUrl)) return fetchYoutubePreview(inputUrl);
  if (isTikTokUrl(inputUrl)) return fetchTikTokPreview(inputUrl);
  if (isInstagramUrl(inputUrl)) return fetchInstagramPreview(inputUrl);
  if (isThreadsUrl(inputUrl)) return fetchThreadsPreview(inputUrl);
  if (isRedditUrl(inputUrl)) return fetchRedditPreview(inputUrl);
  if (isSpotifyUrl(inputUrl)) return fetchSpotifyPreview(inputUrl);
  return null;
}

export { fetchFacebookPreview } from "./facebook";
export { fetchTikTokPreview } from "./tiktok";
export { fetchInstagramPreview, fetchThreadsPreview } from "./instagram";
export { fetchLinkedInPreview } from "./linkedin";
