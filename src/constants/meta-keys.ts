export const META_KEYS = {
  OG_TITLE: "og:title",
  TWITTER_TITLE: "twitter:title",
  OG_DESCRIPTION: "og:description",
  TWITTER_DESCRIPTION: "twitter:description",
  DESCRIPTION: "description",
  OG_IMAGE: "og:image",
  OG_IMAGE_SECURE_URL: "og:image:secure_url",
  TWITTER_IMAGE: "twitter:image",
  TWITTER_IMAGE_SRC: "twitter:image:src",
  OG_SITE_NAME: "og:site_name",
  APPLICATION_NAME: "application-name",
  OG_TYPE: "og:type",
  OG_URL: "og:url",
} as const;

export const META_TITLE_KEYS = [META_KEYS.OG_TITLE, META_KEYS.TWITTER_TITLE] as const;

export const META_DESCRIPTION_KEYS = [
  META_KEYS.OG_DESCRIPTION,
  META_KEYS.TWITTER_DESCRIPTION,
  META_KEYS.DESCRIPTION,
] as const;

export const META_IMAGE_KEYS = [
  META_KEYS.OG_IMAGE,
  META_KEYS.TWITTER_IMAGE,
  META_KEYS.TWITTER_IMAGE_SRC,
] as const;

export const META_FACEBOOK_IMAGE_KEYS = [
  META_KEYS.OG_IMAGE,
  META_KEYS.OG_IMAGE_SECURE_URL,
  META_KEYS.TWITTER_IMAGE,
  META_KEYS.TWITTER_IMAGE_SRC,
] as const;

export const META_SITE_NAME_KEYS = [META_KEYS.OG_SITE_NAME, META_KEYS.APPLICATION_NAME] as const;
