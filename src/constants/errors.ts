export const ERROR_MESSAGES = {
  INVALID_URL: "Invalid URL",
  ONLY_HTTP_HTTPS: "Only http and https URLs are allowed",
  URL_NOT_ALLOWED: "This URL is not allowed",
  INTERNAL_HOSTNAMES: "Internal hostnames are not allowed",
  PRIVATE_NETWORK: "Private or local network addresses are not allowed",
  NO_PREVIEW_METADATA:
    "No preview metadata found for this URL. The site may block link previews.",
} as const;
