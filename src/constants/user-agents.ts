import { POSTMAN_FETCH_HEADERS } from "./headers";

export const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36";

export const FACEBOOK_BOT_UA =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

export const FACEBOOK_LETTER_USER_AGENTS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const FACEBOOK_RANDOM_LETTER_COUNT = 3;

export const DIRECT_PREVIEW_USER_AGENTS = [
  "A",
  POSTMAN_FETCH_HEADERS["User-Agent"],
  FACEBOOK_BOT_UA,
  "Twitterbot/1.0",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
  "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
  "LinkedInBot/1.0 (compatible; Mozilla/5.0; +https://www.linkedin.com/)",
  "Facebot",
  "TelegramBot (like TwitterBot)",
  "WhatsApp/2.0",
  BROWSER_USER_AGENT,
] as const;

export type PreviewUserAgent = (typeof DIRECT_PREVIEW_USER_AGENTS)[number];

/** ChatGPT blocks facebookexternalhit (403) — try these crawlers first. */
export const CHATGPT_PRIORITY_UAS = [
  "Twitterbot/1.0",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
  BROWSER_USER_AGENT,
] as const;

export const LINKEDIN_USER_AGENTS = [
  "Twitterbot/1.0",
  BROWSER_USER_AGENT,
  "LinkedInBot/1.0 (compatible; Mozilla/5.0; +https://www.linkedin.com/)",
] as const;
