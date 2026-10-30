import {
  COMPANY_PHONE_DISPLAY,
  COMPANY_PHONE_SMS_HREF,
  COMPANY_PHONE_TEL_HREF,
} from "@/lib/content/company";

type CallTextActionsProps = {
  /** "dark" for the charcoal footer, "light" for white/neutral surfaces. */
  variant?: "dark" | "light";
  /** Stack the buttons vertically (narrow surfaces such as the nav drawer). */
  stacked?: boolean;
  className?: string;
};

const base =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

const styles = {
  dark: {
    number: "text-foreground-on-dark",
    call: `${base} bg-accent text-white hover:bg-accent-hover focus-visible:outline-accent-on-dark`,
    text: `${base} border border-accent-on-dark text-accent-on-dark hover:bg-white/10 focus-visible:outline-accent-on-dark`,
  },
  light: {
    number: "text-neutral-900",
    call: `${base} bg-accent text-white hover:bg-accent-hover focus-visible:outline-accent`,
    text: `${base} border border-accent text-accent hover:bg-accent-subtle focus-visible:outline-accent`,
  },
} as const;

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.19a2 2 0 0 1 2.11-.45c.84.29 1.72.5 2.62.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * Call Now / Text Now for the business line. The number stays visible as plain
 * text because a device may have no dialer or SMS app configured. A plain
 * server component: tel:/sms: are ordinary links, no client JS or third party.
 */
export default function CallTextActions({
  variant = "light",
  stacked = false,
  className = "",
}: CallTextActionsProps) {
  const s = styles[variant];
  return (
    <div className={className}>
      <p className={`mb-2 text-sm font-semibold ${s.number}`}>{COMPANY_PHONE_DISPLAY}</p>
      <div className={`flex gap-2 ${stacked ? "flex-col" : "flex-col sm:flex-row"}`}>
        <a href={COMPANY_PHONE_TEL_HREF} className={s.call} aria-label={`Call now ${COMPANY_PHONE_DISPLAY}`}>
          <PhoneIcon />
          Call Now
        </a>
        <a href={COMPANY_PHONE_SMS_HREF} className={s.text} aria-label={`Text now ${COMPANY_PHONE_DISPLAY}`}>
          <MessageIcon />
          Text Now
        </a>
      </div>
    </div>
  );
}
