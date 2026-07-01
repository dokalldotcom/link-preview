import type { PlatformDefaults, PlatformId } from "@/types";

export const PLATFORM_DEFAULTS: Record<PlatformId, PlatformDefaults> = {
  youtube: {
    siteName: "YouTube",
    type: "video",
    favicon: "https://www.youtube.com/s/desktop/favicon_48x48.png",
  },
  x: {
    siteName: "X",
    type: "article",
    favicon: "https://abs.twimg.com/favicons/twitter.3.ico",
  },
  tiktok: {
    siteName: "TikTok",
    type: "video",
    favicon: "https://www.tiktok.com/favicon.ico",
  },
  instagram: {
    siteName: "Instagram",
    type: "article",
    favicon: "https://www.instagram.com/favicon.ico",
  },
  threads: {
    siteName: "Threads",
    type: "article",
    favicon: "https://static.cdninstagram.com/rsrc.php/y4/r/pctUncuduBn.svg",
  },
  reddit: {
    siteName: "Reddit",
    type: "article",
    favicon: "https://www.redditstatic.com/shreddit/assets/favicon/64x64.png",
  },
  spotify: {
    siteName: "Spotify",
    type: "music",
    favicon: "https://open.spotify.com/favicon.ico",
  },
  facebook: {
    siteName: "Facebook",
    type: "website",
    favicon: "https://static.xx.fbcdn.net/rsrc.php/y1/r/ay1hV6OlegS.ico",
  },
  linkedin: {
    siteName: "LinkedIn",
    type: "article",
    favicon: "https://www.linkedin.com/favicon.ico",
  },
  chatgpt: {
    siteName: "ChatGPT",
    type: "website",
    favicon: "https://chatgpt.com/favicon.ico",
  },
} as const;

export const PLATFORM_REJECT_URL_PATTERNS: Partial<Record<PlatformId, readonly string[]>> = {
  facebook: ["/login"],
  tiktok: ["/notfound"],
  instagram: ["/accounts/login"],
  threads: ["/accounts/login"],
  linkedin: ["/authwall"],
} as const;

export const X_SYNDICATION_URL_TEMPLATE =
  "https://cdn.syndication.twimg.com/tweet-result?id={tweetId}&token=1" as const;

export function buildXSyndicationUrl(tweetId: string) {
  return X_SYNDICATION_URL_TEMPLATE.replace("{tweetId}", tweetId);
}

export function buildYoutubeOEmbedUrl(inputUrl: string) {
  return `https://www.youtube.com/oembed?url=${encodeURIComponent(inputUrl)}&format=json`;
}

export function buildXOEmbedUrl(inputUrl: string) {
  return `https://publish.x.com/oembed?url=${encodeURIComponent(inputUrl)}`;
}

export function buildTikTokOEmbedUrl(inputUrl: string) {
  return `https://www.tiktok.com/oembed?url=${encodeURIComponent(inputUrl)}`;
}

export const TIKTOK_OEMBED_REFERER = "https://www.tiktok.com/" as const;

export function buildRedditOEmbedUrl(inputUrl: string) {
  return `https://www.reddit.com/oembed?format=json&url=${encodeURIComponent(inputUrl)}`;
}

export function buildSpotifyOEmbedUrl(inputUrl: string) {
  return `https://open.spotify.com/oembed?url=${encodeURIComponent(inputUrl)}`;
}

export const LINKEDIN_AUTHWALL_STATUS = 999;
