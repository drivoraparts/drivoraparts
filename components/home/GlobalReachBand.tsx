import EditorialImage from "./EditorialImage";
import ScrollReveal from "./ScrollReveal";
import { getPhoto } from "@/lib/media/homepage-photo";

/**
 * A full-bleed breath between the storytelling and the shopping sections, so
 * the page changes shape rather than stacking another row of cards.
 *
 * The figures here are capabilities, not achievements. There is deliberately
 * no order count, customer count or rating: none of those are measured, and
 * inventing them is the fastest way to make a real business look fake.
 */
const FACTS = [
  { label: "Delivery", value: "Worldwide" },
  { label: "Shipping", value: "Free & express" },
  { label: "Oversize freight", value: "LTL capable" },
  { label: "Checkout", value: "Secure & crypto" },
];

export default function GlobalReachBand() {
  const hasPhoto = Boolean(getPhoto("shipping"));

  return (
    <section className="relative isolate overflow-hidden bg-background-dark py-24 sm:py-32">
      {hasPhoto ? (
        <div className="absolute inset-0 -z-10">
          <EditorialImage
            slot="shipping"
            alt=""
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-background-dark/72" />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <ScrollReveal className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent-on-dark">
            Wherever you build
          </p>
          <h2 className="mt-4 text-[clamp(1.9rem,4.4vw,3.25rem)] font-bold uppercase leading-[1.02] tracking-[-0.015em] text-foreground-on-dark">
            We ship it to you
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-on-dark">
            Small parts move by air. Truck beds, engines and transmissions move
            by freight. Tell us where it is going and we will quote it properly.
          </p>
        </ScrollReveal>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border-on-dark pt-10 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-on-dark">
                {f.label}
              </dt>
              <dd className="mt-2 text-lg font-bold tracking-tight text-foreground-on-dark sm:text-xl">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
