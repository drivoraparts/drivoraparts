/** Shared Tailwind class tokens for the white SaaS admin theme. */
export const adminUi = {
  page: "min-h-screen bg-zinc-50 text-zinc-900",
  sidebar:
    "relative z-40 flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white shadow-sm",
  sidebarBrand: "border-b border-zinc-200 px-5 py-6",
  sidebarNav: "flex-1 space-y-1 overflow-y-auto p-3",
  sidebarFooter: "border-t border-zinc-200 p-4",
  main: "flex min-w-0 flex-1 flex-col",
  content: "flex-1 overflow-y-auto bg-zinc-50",
  topBar:
    "sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-6 ",
  shell: "px-6 py-8 lg:px-8",
  shellHeader: "mb-8 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between",
  kicker: "text-sm font-medium uppercase tracking-widest text-red-600",
  title: "text-3xl font-semibold tracking-tight text-zinc-900",
  card: "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm",
  cardCompact: "rounded-xl border border-zinc-200 bg-white p-5 shadow-sm",
  statCard: "rounded-xl border border-zinc-200 bg-white p-6 shadow-sm",
  statLabel: "text-sm font-medium text-zinc-600",
  statValue: "mt-2 text-3xl font-semibold text-zinc-900",
  statHint: "mt-2 text-xs text-zinc-600",
  navLink:
    "flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
  navLinkActive: "bg-red-50 text-red-700 ring-1 ring-red-200",
  navLinkIdle: "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
  input:
    "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100",
  inputDisabled: "w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-zinc-600",
  buttonPrimary:
    "rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60",
  buttonSecondary:
    "rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:border-red-300 hover:text-red-700 disabled:opacity-60",
  tableHead: "border-b border-zinc-200 text-zinc-600",
  tableRow: "border-b border-zinc-100",
  muted: "text-sm text-zinc-600",
  errorBox: "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
  successBox:
    "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700",
  warningBox:
    "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800",
} as const;
