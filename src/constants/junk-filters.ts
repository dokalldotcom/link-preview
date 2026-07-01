export const JUNK_PREVIEW_TITLES = {
  FACEBOOK: "Facebook",
  TIKTOK: "TikTok",
  INSTAGRAM: "Instagram",
  THREADS: "Threads",
} as const;

export const JUNK_TIKTOK_DESCRIPTION = "TikTok" as const;

export const CLOUDFLARE_JUNK_TITLE_PATTERN =
  /just a moment|attention required|please wait|checking your browser/;

export const CLOUDFLARE_HTML_MARKERS = {
  BROWSER_VERIFICATION: "cf-browser-verification",
  CHALLENGE_PLATFORM: "challenge-platform",
  JUST_A_MOMENT: /just a moment/i,
  CHECKING_BROWSER: /checking your browser/i,
} as const;

export const CLOUDFLARE_BLOCKED_STATUS_CODES = [403, 503] as const;

export const CLOUDFLARE_SMALL_HTML_THRESHOLD = 50_000;
