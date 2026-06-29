import FooterContent from "./FooterContent";

export default function GlobalFooter() {
  return (
    <footer className="mt-16 w-full min-w-0 max-w-full overflow-x-clip border-t border-neutral-300 bg-[#e5e7eb] text-neutral-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <FooterContent />
    </footer>
  );
}
