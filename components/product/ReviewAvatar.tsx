"use client";

import { useState } from "react";
import { directAssetUrl } from "@/lib/media/optimize-image";

const SIZES = {
  xs: 18,
  sm: 24,
  md: 28,
} as const;

type ReviewAvatarProps = {
  name: string;
  src?: string;
  size?: keyof typeof SIZES;
  className?: string;
};

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ReviewAvatar({
  name,
  src,
  size = "md",
  className = "",
}: ReviewAvatarProps) {
  const initials = getInitials(name);
  const [failed, setFailed] = useState(false);
  const px = SIZES[size];

  const shellClass = [
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-100",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (src && !failed) {
    return (
      <img
        src={directAssetUrl(src)}
        alt=""
        aria-hidden
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        className={`${shellClass} object-cover`}
        style={{ width: px, height: px, minWidth: px, minHeight: px }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={shellClass}
      style={{ width: px, height: px, minWidth: px, minHeight: px }}
      aria-hidden
    >
      <span
        className="font-semibold text-neutral-600"
        style={{ fontSize: Math.max(9, px * 0.38) }}
      >
        {initials}
      </span>
    </div>
  );
}
