export default function AftermarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="storefront-page min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-[var(--background)] text-neutral-900">
      {children}
    </div>
  );
}
