"use client";

import Link from "next/link";
import CurrencyFooterNote from "@/components/currency/CurrencyFooterNote";
import CompanyAddress from "@/components/content/CompanyAddress";
import { useTranslation } from "@/hooks/useTranslation";

export default function FooterContent() {
  const { t } = useTranslation();

  return (
    <>
      <div className="grid grid-cols-1 gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <h2 className="mb-3 text-lg font-bold">
            Drivora<span className="text-red-500">Parts</span>
          </h2>
          <CompanyAddress variant="summary" className="mb-3" />
          <p className="text-xs text-gray-500">{t("footerBrand")}</p>
        </div>

        <div>
          <h3 className="mb-3 text-red-500">{t("quickLinks")}</h3>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <Link href="/catalog/all">All Products</Link>
            <Link href="/catalog">Enter Market</Link>
            <Link href="/">{t("home")}</Link>
            <Link href="/contact">{t("contactSupport")}</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-red-500">{t("policies")}</h3>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <Link href="/policies/privacy-policy">{t("privacyPolicy")}</Link>
            <Link href="/policies/cookie-policy">{t("cookiePolicy")}</Link>
            <Link href="/policies/accessibility-statement">{t("accessibility")}</Link>
            <Link href="/policies/dpa">{t("dpa")}</Link>
            <Link href="/policies/terms-of-service">{t("termsOfService")}</Link>
            <Link href="/policies/acceptable-use-policy">{t("acceptableUse")}</Link>
            <Link href="/policies/eula">{t("eula")}</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-red-500">{t("legalOperations")}</h3>
          <div className="flex flex-col gap-2 text-sm text-neutral-600">
            <Link href="/policies/shipping-policy">{t("shippingPolicy")}</Link>
            <Link href="/policies/refund-policy">{t("returnsRefunds")}</Link>
            <Link href="/policies/terms-of-sale">{t("termsOfSale")}</Link>
            <Link href="/policies/disclaimer">{t("disclaimer")}</Link>
            <Link href="/policies/affiliate-disclosure">{t("affiliateDisclosure")}</Link>
            <Link href="/policies/liability">{t("liability")}</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-500">
        <CurrencyFooterNote />
        © {new Date().getFullYear()} DrivoraParts LLC. {t("rightsReserved")}
      </div>
    </>
  );
}
