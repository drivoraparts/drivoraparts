/** One-colour line icons for trust signals: same stroke weight everywhere. */
const PATHS = {
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
  returns: "M3 12a9 9 0 1 0 3-6.7M3 4v5h5",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z",
  badge: "M12 3l2.6 2 3.3-.3.9 3.2 2.7 1.9-1.3 3.1 1.3 3.1-2.7 1.9-.9 3.2-3.3-.3L12 21l-2.6-2-3.3.3-.9-3.2-2.7-1.9L3.8 11 2.5 7.9l2.7-1.9.9-3.2 3.3.3zM8.5 12l2.5 2.5 4.5-5",
  truck: "M3 6h11v10H3zM14 9h4l3 3v4h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
} as const;

export type TrustIconName = keyof typeof PATHS;

export default function TrustIcon({ name, size = 16 }: { name: TrustIconName; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
