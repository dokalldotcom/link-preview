import {
  CHATGPT_PRIORITY_UAS,
  CLOUDFLARE_PRIORITY_UAS,
  DIRECT_PREVIEW_USER_AGENTS,
  FACEBOOK_BOT_UA,
  GOOGLEBOT_UA,
  type PreviewUserAgent,
} from "@/constants";
import { isChatGptUrl, shuffle } from "@/lib";

export function acceptHeaderForUserAgent(userAgent: string) {
  if (
    /^[A-Z]$/.test(userAgent) ||
    userAgent.startsWith("PostmanRuntime/") ||
    userAgent === "WhatsApp/2.0"
  ) {
    return "*/*";
  }

  return "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8";
}

export function buildDirectPreviewUserAgents(inputUrl: string): PreviewUserAgent[] {
  if (isChatGptUrl(inputUrl)) {
    const priority = new Set<string>(CHATGPT_PRIORITY_UAS);
    const rest = shuffle(
      DIRECT_PREVIEW_USER_AGENTS.filter((ua: PreviewUserAgent) => !priority.has(ua)),
    );
    return [...CHATGPT_PRIORITY_UAS, ...rest];
  }

  const priority = new Set<string>([...CLOUDFLARE_PRIORITY_UAS, FACEBOOK_BOT_UA, GOOGLEBOT_UA]);
  const rest = shuffle(
    DIRECT_PREVIEW_USER_AGENTS.filter((ua: PreviewUserAgent) => !priority.has(ua)),
  );
  return [...CLOUDFLARE_PRIORITY_UAS, FACEBOOK_BOT_UA, ...rest];
}
