/** DrivoraParts social profiles, shown as icons in the footer. TikTok only. */
export const SOCIAL_PROFILES = [
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@drivoraparts" },
] as const;

export type SocialProfileId = (typeof SOCIAL_PROFILES)[number]["id"];
