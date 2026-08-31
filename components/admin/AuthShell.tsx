import Link from "next/link";
import { useState, type ReactNode } from "react";
import { adminUi } from "./admin-ui";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4.5 w-4.5">
      <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4.5 w-4.5">
      <path
        d="M2.5 2.5l15 15M8.3 8.4a2.5 2.5 0 003.3 3.3M6.2 6.3C3.8 7.6 2 10 2 10s3 6 8 6c1.5 0 2.8-.4 3.9-1M11.8 4.4A9.5 9.5 0 0118 10s-.7 1.4-2 2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  autoComplete,
  value,
  onChange,
  minLength,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  required?: boolean;
}) {
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={isPassword ? `${adminUi.input} pr-10` : adminUi.input}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-600"
          >
            <EyeIcon open={revealed} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function AuthAlert({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: ReactNode;
}) {
  const styles = {
    error: adminUi.errorBox,
    success: adminUi.successBox,
    info: adminUi.warningBox,
  }[tone];

  return <p className={styles}>{children}</p>;
}

export function AuthButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button type="submit" disabled={loading} className={`w-full ${adminUi.buttonPrimary}`}>
      {loading ? loadingLabel : label}
    </button>
  );
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 text-zinc-900">
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <span className="text-lg font-bold text-accent">D</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-accent">
            DrivoraParts
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{title}</h1>
          <p className={`mt-2 text-sm leading-6 ${adminUi.muted}`}>{subtitle}</p>
        </div>

        <div className={`rounded-[28px] p-8 ${adminUi.card}`}>{children}</div>

        {footer ? <div className={`mt-6 text-center text-sm ${adminUi.muted}`}>{footer}</div> : null}
      </div>
    </main>
  );
}

export function AuthFooterLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="font-medium text-accent transition hover:text-accent">
      {children}
    </Link>
  );
}
