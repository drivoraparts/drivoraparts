import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center text-zinc-900">
      <p className="text-sm font-semibold uppercase tracking-widest text-red-600">404</p>
      <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-zinc-600">
        The page you requested does not exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500"
      >
        Back to homepage
      </Link>
    </main>
  );
}
