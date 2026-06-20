import Link from "next/link";

export default function GlobalFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-black text-white mt-20">
      <div className="px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h2 className="font-bold text-lg mb-3">
            Drivora<span className="text-red-500">Parts</span>
          </h2>
          <p className="text-gray-400 text-sm">
            Engineered automotive performance parts for builders who demand control, power, and precision.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-red-500 mb-3">Quick Links</h3>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <Link href="/catalog">Catalog</Link>
            <Link href="/">Home</Link>
          </div>
        </div>

        {/* POLICIES */}
        <div>
          <h3 className="text-red-500 mb-3">Policies</h3>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <Link href="/policies/privacy-policy">Privacy Policy</Link>
            <Link href="/policies/cookie-policy">Cookie Policy</Link>
            <Link href="/policies/accessibility-statement">Accessibility</Link>
            <Link href="/policies/dpa">Data Processing Agreement</Link>
            <Link href="/policies/terms-of-service">Terms of Service</Link>
            <Link href="/policies/acceptable-use-policy">Acceptable Use</Link>
            <Link href="/policies/eula">EULA</Link>
          </div>
        </div>

        {/* LEGAL + SHIPPING */}
        <div>
          <h3 className="text-red-500 mb-3">Legal & Operations</h3>
          <div className="flex flex-col gap-2 text-gray-300 text-sm">
            <Link href="/policies/shipping-policy">Shipping Policy</Link>
            <Link href="/policies/refund-policy">Returns & Refunds</Link>
            <Link href="/policies/terms-of-sale">Terms of Sale</Link>
            <Link href="/policies/disclaimer">Disclaimer</Link>
            <Link href="/policies/affiliate-disclosure">Affiliate Disclosure</Link>
            <Link href="/policies/liability">Liability</Link>
          </div>
        </div>

      </div>

      <div className="text-center text-gray-500 text-xs py-6 border-t border-white/10">
        © {new Date().getFullYear()} DrivoraParts LLC. All rights reserved.
      </div>
    </footer>
  );
}