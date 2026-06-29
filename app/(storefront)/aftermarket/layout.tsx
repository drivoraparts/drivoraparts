export default function AftermarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-white text-neutral-900">
      {children}
    </div>
  );
}
