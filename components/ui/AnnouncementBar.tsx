import {
  BASE_ORDER_DISCOUNT_PERCENT,
  BULK_ORDER_DISCOUNT_PERCENT,
} from "@/lib/inventory/discounts";

type AnnouncementMessage = {
  icon: string;
  text: string;
};

// Copy kept truthful to real, always-on mechanics, not a fabricated "today
// only" sale. Both rates are imported from lib/inventory/discounts.ts rather
// than written out, so the ticker cannot advertise a discount that checkout
// does not actually apply.
const DEFAULT_MESSAGES: AnnouncementMessage[] = [
  { icon: "🔧", text: `Buy 2+ Items — Save ${BULK_ORDER_DISCOUNT_PERCENT}%` },
  { icon: "🌎", text: "Worldwide Shipping & Freight Available" },
  { icon: "🛠️", text: "OEM & Aftermarket Parts For Serious Builds" },
  { icon: "💳", text: `Every Order — Save ${BASE_ORDER_DISCOUNT_PERCENT}%` },
  { icon: "🔒", text: "Secure Checkout · Verified Listings · Global Freight" },
  { icon: "⚡", text: "1,446+ Listings — Inventory Growing Regularly" },
];

/** Fixed, scrolling brand/offer strip directly under the header. */
export default function AnnouncementBar({
  messages = DEFAULT_MESSAGES,
}: {
  messages?: AnnouncementMessage[];
}) {
  const loop = [...messages, ...messages];

  return (
    <div
      className="announcement-bar fixed inset-x-0 top-[72px] z-[9998] h-[34px] overflow-hidden border-b border-neutral-800 bg-neutral-950 sm:top-[80px]"
      role="region"
      aria-label="Announcements"
    >
      <div className="announcement-marquee-mask relative h-full overflow-hidden">
        <div className="announcement-marquee-track flex h-full w-max items-center gap-x-10 pl-10">
          {loop.map((message, index) => (
            <span
              key={`${message.text}-${index}`}
              className="flex shrink-0 items-center gap-2 text-[11px] font-semibold tracking-wide text-neutral-300"
            >
              <span aria-hidden>{message.icon}</span>
              {message.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
