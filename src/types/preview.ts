export interface LinkPreviewData {
  url: string;
  finalUrl?: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  favicon?: string;
}

export type LinkPreviewType = "article" | "video" | "music" | "website";

export interface LinkPreviewResponse {
  ok: boolean;
  message?: string;
  preview?: LinkPreviewData;
}

export interface FetchLinkPreviewOptions {}

export type ValidateLinkPreviewResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

/** @deprecated Use {@link ValidateLinkPreviewResult} */
export type ValidateDirectPreviewUrlResult = ValidateLinkPreviewResult;
