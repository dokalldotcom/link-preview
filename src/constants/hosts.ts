import type { PlatformId } from "@/types";

export const PLATFORM_HOSTS: Record<PlatformId, readonly string[]> = {
  youtube: ["youtu.be", "youtube.com"],
  x: ["x.com", "twitter.com"],
  tiktok: ["tiktok.com", "vm.tiktok.com", "vt.tiktok.com"],
  instagram: ["instagram.com"],
  threads: ["threads.net", "threads.com"],
  reddit: ["reddit.com"],
  spotify: ["open.spotify.com", "spotify.com"],
  facebook: ["facebook.com", "fb.com", "fb.watch"],
  linkedin: ["linkedin.com"],
  chatgpt: ["chatgpt.com", "openai.com"],
} as const;

export const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.google",
  "kubernetes.default.svc",
]);

export const BLOCKED_HOSTNAME_SUFFIXES = [".local", ".internal", ".localhost"] as const;

export const ALLOWED_URL_PROTOCOLS = ["http:", "https:"] as const;

export const CLOUDFLARE_SERVER_HEADER = "cloudflare" as const;
export const CLOUDFLARE_MITIGATED_HEADER = "cf-mitigated" as const;
export const CLOUDFLARE_CHALLENGE_VALUE = "challenge" as const;

export const FACEBOOK_UNUSABLE_IMAGE_HOST = "lookaside.fbsbx.com" as const;
export const FACEBOOK_SCONTENT_PATTERN = /scontent/i;
export const FACEBOOK_FBCDN_PATTERN = /\.fbcdn\.net/i;
