import CompanyAddress from "@/components/content/CompanyAddress";
import { COMPANY_SUPPORT_EMAIL } from "@/lib/content/company";

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12 text-white">
      <h1 className="text-4xl font-bold mb-6">Contact Support</h1>

      <div className="space-y-6 text-gray-300">
        <p>
          Need help with a product, marketplace feature, account question, or
          general inquiry?
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">Support</h2>
          <p>
            Email:{" "}
            <a
              href={`mailto:${COMPANY_SUPPORT_EMAIL}`}
              className="text-red-400 hover:text-red-300"
            >
              {COMPANY_SUPPORT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            Response times may vary depending on inquiry volume.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">
            U.S. Corporate Headquarters
          </h2>
          <CompanyAddress variant="us-hq" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-3">
            Business Inquiries
          </h2>
          <p>
            Partnerships, vendor onboarding, and marketplace opportunities can
            be directed through our support channel for review.
          </p>
        </div>
      </div>
    </main>
  );
}
