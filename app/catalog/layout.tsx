export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-clip bg-black text-white">{children}</div>;
}