/** DrivoraParts social profiles, shown as icons in the footer. */
export const SOCIAL_PROFILES = [
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@drivoraparts" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/drivora_parts" },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/share/18ZjQr6sr9/?mibextid=wwXIfr",
  },
] as const;

export type SocialProfileId = (typeof SOCIAL_PROFILES)[number]["id"];
