import type { Metadata } from "next";
import { buildPageMetadata } from "./metadata";

const POLICY_SEO: Record<string, { title: string; description: string }> = {
  "/policies/privacy-policy": {
    title: "Privacy Policy",
    description:
      "How DrivoraParts collects, uses, and protects your personal data when you shop performance auto parts online.",
  },
  "/policies/cookie-policy": {
    title: "Cookie Policy",
    description:
      "Learn how DrivoraParts uses cookies and similar technologies on our automotive performance marketplace.",
  },
  "/policies/shipping-policy": {
    title: "Shipping Policy",
    description:
      "DrivoraParts shipping times, freight handling for truck beds and oversized parts, and international delivery.",
  },
  "/policies/refund-policy": {
    title: "Returns & Refund Policy",
    description:
      "30-day return window, condition requirements, and refund processing for DrivoraParts performance parts orders.",
  },
  "/policies/terms-of-service": {
    title: "Terms of Service",
    description:
      "Terms governing use of the DrivoraParts automotive performance parts marketplace and website.",
  },
  "/policies/terms-of-sale": {
    title: "Terms of Sale",
    description:
      "Purchase terms for performance engines, 4x4 accessories, truck beds, and parts sold on DrivoraParts.",
  },
  "/policies/acceptable-use-policy": {
    title: "Acceptable Use Policy",
    description: "Acceptable use rules for DrivoraParts customers, sellers, and website visitors.",
  },
  "/policies/accessibility-statement": {
    title: "Accessibility Statement",
    description:
      "DrivoraParts commitment to accessible shopping for automotive performance parts online.",
  },
  "/policies/affiliate-disclosure": {
    title: "Affiliate Disclosure",
    description: "Affiliate and partner disclosure for DrivoraParts content and product links.",
  },
  "/policies/disclaimer": {
    title: "Disclaimer",
    description:
      "Product fitment, installation, and liability disclaimers for performance and 4x4 parts sold on DrivoraParts.",
  },
  "/policies/liability": {
    title: "Limitation of Liability",
    description: "Limitation of liability terms for DrivoraParts LLC and marketplace transactions.",
  },
  "/policies/dpa": {
    title: "Data Processing Agreement",
    description: "Data processing agreement for DrivoraParts business and vendor relationships.",
  },
  "/policies/eula": {
    title: "End User License Agreement",
    description: "Software and digital content end-user license terms for DrivoraParts services.",
  },
};

export function buildPolicyMetadata(path: string): Metadata {
  const copy = POLICY_SEO[path] ?? {
    title: "Policies & Legal",
    description: "Legal policies for shopping performance auto parts at DrivoraParts.",
  };

  return buildPageMetadata({
    title: copy.title,
    description: copy.description,
    path,
  });
}
