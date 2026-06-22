import Link from "next/link";
import type { ReactNode } from "react";
import { adminUi } from "./admin-ui";

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
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-zinc-700">
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
        className={adminUi.input}
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
            <span className="text-lg font-bold text-red-600">D</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-600">
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
    <Link href={href} className="font-medium text-red-600 transition hover:text-red-500">
      {children}
    </Link>
  );
}
