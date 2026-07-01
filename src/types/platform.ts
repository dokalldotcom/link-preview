import type { LinkPreviewData, LinkPreviewType } from "./preview";

export type PlatformId =
  | "youtube"
  | "x"
  | "tiktok"
  | "instagram"
  | "threads"
  | "reddit"
  | "spotify"
  | "facebook"
  | "linkedin"
  | "chatgpt";

export interface PlatformDefaults {
  siteName: string;
  type: LinkPreviewType;
  favicon: string;
}

export interface MetaCrawlerConfig {
  rejectSubstrings?: string[];
  rejectFinalUrl?: (url: string) => boolean;
  isJunk: (preview: LinkPreviewData, finalUrl?: string) => boolean;
  siteName: string;
  favicon: string;
  type?: LinkPreviewType;
  timeoutMs?: number;
}

export type HtmlFetchResult = { response: Response; html: string };
