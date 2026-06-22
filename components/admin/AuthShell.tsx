import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

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
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-red-400/60 focus:ring-2 focus:ring-red-500/20"
      />
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
    error: "border-red-500/30 bg-red-500/10 text-red-100",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100",
    info: "border-amber-500/30 bg-amber-500/10 text-amber-100",
  }[tone];

  return (
    <p className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</p>
  );
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
    <button
      type="submit"
      disabled={loading}
      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition hover:from-red-500 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="relative z-10">{loading ? loadingLabel : label}</span>
      <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
    </button>
  );
}

export default function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.18),transparent_40%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            <span className="text-lg font-bold text-red-400">D</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-400">
            DrivoraParts
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{subtitle}</p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {children}
        </div>

        {footer ? <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div> : null}
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
    <Link href={href} className="font-medium text-red-300 transition hover:text-red-200">
      {children}
    </Link>
  );
}
