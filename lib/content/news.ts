/**
 * DrivoraParts News: company editorial articles.
 *
 * Every article here is written by DrivoraParts about its own business and
 * about buying parts online. It is company content, not independent
 * journalism, and the pages say so. Keep it that way when adding to this file:
 *
 *  - No figures about DrivoraParts itself (customers, orders, sales, growth,
 *    funding), no partnerships, awards, press coverage or facilities. None is
 *    documented for publication.
 *  - No claim of automated VIN verification or guaranteed fitment. What the
 *    site can say is that a customer may contact support with a VIN or part
 *    number before ordering, for fitment assistance.
 *  - No legal-entity statement. The legal name lives in lib/content/company.ts
 *    and is not restated in editorial copy.
 *  - Shipping is quoted by hand per order (lib/shipping/config.ts). No speed,
 *    free-shipping or warehouse claims.
 *  - Any outside statistic must be attributed in the text and listed in the
 *    article's `sources`, with the page it was read from.
 *
 * Covers are existing Pexels-licensed homepage photographs (no attribution
 * required; see lib/content/homepage-photography.json).
 */

export type NewsBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string };

export type NewsSource = {
  label: string;
  url: string;
  /** What the cited page was used for, shown beside the link. */
  note: string;
};

export type NewsArticle = {
  slug: string;
  title: string;
  /** Meta description and card excerpt. */
  excerpt: string;
  category: string;
  /** ISO date. All four launch articles share one publication date. */
  datePublished: string;
  cover: { src: string; alt: string };
  body: NewsBlock[];
  sources?: NewsSource[];
};

export const NEWS_AUTHOR = "DrivoraParts Editorial Team";
export const NEWS_LABEL = "Company editorial content";
export const NEWS_PATH = "/news";

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    slug: "drivoraparts-building-marketplace-hard-to-find-components",
    title: "DrivoraParts Is Building a Marketplace for Hard-to-Find Automotive Components",
    excerpt:
      "Why finding the exact engine, transmission or truck component is still hard, and the approach DrivoraParts is taking to make that search easier.",
    category: "Company News",
    datePublished: "2026-10-03",
    cover: {
      src: "/homepage/project/1600.webp",
      alt: "A mechanic working on a car engine with the hood open",
    },
    body: [
      {
        type: "p",
        text: "Ask anyone who has restored a truck, swapped an engine or kept an older 4WD on the road: the hard part is rarely deciding what to do. It is finding the one component that actually fits the vehicle in the driveway.",
      },
      {
        type: "p",
        text: "DrivoraParts is an online marketplace built around that problem. This article explains what it is trying to do, what it covers, and what it deliberately does not claim.",
      },
      { type: "h2", text: "The problem with exact parts" },
      {
        type: "p",
        text: "Automotive parts are specific in ways that are easy to underestimate. A transmission can differ by year, engine, drivetrain and internal revision. An engine can look identical to its neighbour and still need different accessories or a different control setup. A truck component may suit one cab, bed or axle configuration and not the next.",
      },
      {
        type: "p",
        text: "For buyers, that usually means searching across several sellers, each focused on one brand or one category, and then working out for themselves whether the listing matches their vehicle.",
      },
      { type: "h2", text: "What the marketplace covers" },
      {
        type: "p",
        text: "DrivoraParts lists specialty and hard-to-source components across several areas:",
      },
      {
        type: "ul",
        items: [
          "Engines and engine-swap components",
          "Automatic and manual transmissions",
          "Performance parts such as turbochargers and suspension upgrades",
          "Truck and 4WD equipment",
          "Vehicle-specific components, in both OEM and aftermarket form",
        ],
      },
      {
        type: "p",
        text: "The site offers market views for the United States, the United Kingdom and Australia, plus a worldwide view, so buyers outside the US can browse the same catalog.",
      },
      { type: "h2", text: "Relevance over volume" },
      {
        type: "p",
        text: "A large catalog is not the same as a useful one. A listing is only helpful if the buyer can tell what it is, what vehicle it suits and what condition it is in. DrivoraParts treats the quality and relevance of each listing as more important than simply adding more of them.",
      },
      { type: "h2", text: "Fitment starts with identification" },
      {
        type: "p",
        text: "Matching a part to a vehicle depends on identifiers: the VIN, the OEM part number, the engine code or transmission identification number, and the exact year, model and engine configuration. These are the details that separate a part that fits from one that only looks right.",
      },
      {
        type: "p",
        text: "Customers are welcome to contact DrivoraParts with their VIN or a part number before ordering and ask for fitment assistance. This is a conversation with the team, not an automated VIN-verification system, and it does not guarantee that a part will fit. The buyer's own confirmation of the vehicle details remains essential.",
      },
      { type: "h2", text: "What comes next" },
      {
        type: "p",
        text: "DrivoraParts is still being built. The direction is plain: clearer listings, better ways to move from a vehicle to the right part, and honest information about what each listing is. This newsroom is part of that, a place for the company to explain how it works and to publish practical buying guidance.",
      },
      {
        type: "note",
        text: "This is company editorial content published by DrivoraParts. It is not independent news coverage.",
      },
    ],
  },
  {
    slug: "vin-part-number-verification-automotive-parts",
    title: "Why VIN and Part-Number Verification Matters When Buying Automotive Parts Online",
    excerpt:
      "A practical guide to the identifiers worth checking before you order an engine, transmission or vehicle-specific part online, and the mistakes it helps you avoid.",
    category: "Buyer Guide",
    datePublished: "2026-10-03",
    cover: {
      src: "/homepage/performance/1600.webp",
      alt: "Close-up of automotive engine parts with visible wiring",
    },
    body: [
      {
        type: "p",
        text: "Ordering a mechanical part online is different from ordering most things. A mistake is not a wrong colour or size; it can mean a heavy component that arrives and does not bolt up, and a return that costs time and money.",
      },
      {
        type: "p",
        text: "Most of those mistakes come from one cause: the buyer and the seller were not talking about the same part. A few minutes of identification before ordering is the cheapest protection there is.",
      },
      { type: "h2", text: "The identifiers worth checking" },
      {
        type: "ul",
        items: [
          "VIN: the 17-character vehicle identification number. It ties a vehicle to its build, and many year, engine and drivetrain details are decoded from it.",
          "OEM part number: the manufacturer's number for the part. It is usually the most direct way to confirm that a replacement is the same component.",
          "Transmission identification: transmissions carry a code or tag, often on the case or a data plate. The same model can come in several internal variants.",
          "Engine code: a short code, usually stamped on the block or listed on an emissions label, that identifies the exact engine rather than just its size.",
          "Year, model and engine configuration: model-year changes, trim levels and optional drivetrains can each change which part applies.",
          "Application details: cab and bed length, axle ratio, two- or four-wheel drive, or the vehicle the engine is being swapped into.",
        ],
      },
      { type: "h2", text: "Where wrong-part orders come from" },
      {
        type: "p",
        text: "Several situations come up repeatedly with online parts orders:",
      },
      {
        type: "ul",
        items: [
          "Mid-year production changes, where two vehicles of the same model and year use different parts.",
          "Parts that look the same but differ in mounting pattern, connectors, gearing or internal components.",
          "A listing that names a vehicle family but not the specific configuration.",
          "Buying by appearance or by a photograph instead of by number.",
          "Swap projects, where the part has to suit both the donor and the destination vehicle.",
        ],
      },
      { type: "h2", text: "How to check before you order" },
      {
        type: "p",
        text: "Start from the vehicle: read the VIN from the dashboard plate or the door-jamb label and note the year, model and engine. Then find the identifier on the part you want to replace, such as the part number, the transmission tag or the engine code, and compare it with the listing.",
      },
      {
        type: "p",
        text: "Read the listing for what it actually states: the application, the condition, and what is included. If any of it is unclear, ask before buying rather than after the part arrives.",
      },
      { type: "h2", text: "Asking DrivoraParts" },
      {
        type: "p",
        text: "If you are unsure whether a listing suits your vehicle, you can contact DrivoraParts through the contact page with your VIN or the part number and ask for fitment assistance before ordering.",
      },
      {
        type: "p",
        text: "That is help from the team. It is not an automated VIN check, and no process can promise perfect fitment. Verification reduces the risk of a wrong part; it does not remove it, which is why your own confirmation of the details matters.",
      },
      {
        type: "note",
        text: "This is company editorial content published by DrivoraParts. It is general buying guidance, not a fitment guarantee for any specific vehicle or listing.",
      },
    ],
  },
  {
    slug: "online-sourcing-specialty-automotive-parts",
    title: "The Rise of Online Sourcing for Specialty Engines, Transmissions and Performance Parts",
    excerpt:
      "Older vehicles, a large specialty-equipment market and growing online retail all point the same way: more buyers look for specialty parts online. What that means for engines, transmissions and truck parts.",
    category: "Industry Context",
    datePublished: "2026-10-03",
    cover: {
      src: "/homepage/hero/1600.webp",
      alt: "An SUV driving along a dirt road through a forest",
    },
    body: [
      {
        type: "p",
        text: "A specialty part is, almost by definition, one that a local counter does not keep on the shelf. An engine for a swap, a transmission for a particular truck, a supercharger, an uncommon suspension component: these are items buyers have long had to hunt for.",
      },
      {
        type: "p",
        text: "Three outside data points help explain why that hunt increasingly happens online. This article cites each one to its source. DrivoraParts is a seller in this market, so treat the article as company commentary rather than independent analysis.",
      },
      { type: "h2", text: "A fleet that keeps getting older" },
      {
        type: "p",
        text: "In its May 2025 analysis, S&P Global Mobility reported that the average age of light vehicles in the United States reached 12.8 years, up two months from 2024. It put passenger cars at 14.5 years and light trucks at 11.9 years.",
      },
      {
        type: "p",
        text: "Older vehicles tend to need replacement components that are no longer stocked widely, which is a large part of why specialty and hard-to-find parts matter to owners and restorers.",
      },
      { type: "h2", text: "A large specialty-equipment market" },
      {
        type: "p",
        text: "The Specialty Equipment Market Association (SEMA) reported in its 2026 market report that the specialty-equipment market generated $52.92 billion in accessory and performance parts sales in 2025.",
      },
      {
        type: "p",
        text: "That figure covers accessory and performance parts in the United States. It does not measure online sales, and it should not be read as a statement about any one seller.",
      },
      { type: "h2", text: "Shopping online is routine" },
      {
        type: "p",
        text: "The US Census Bureau estimated that e-commerce made up 17.1 percent of total retail sales in the second quarter of 2026, on a seasonally adjusted basis, in a release dated August 18, 2026. That figure is for retail as a whole, not for automotive parts specifically.",
      },
      {
        type: "p",
        text: "It does show how normal buying online has become, and that habit carries over to categories where a single purchase is expensive and specific.",
      },
      { type: "h2", text: "What changes for specialty parts" },
      {
        type: "p",
        text: "Buying a specialty component online has real advantages: a wider choice than any one local supplier can hold, and the ability to compare listings across engines, automatic and manual transmissions, superchargers, turbochargers, suspension, truck parts and 4WD components.",
      },
      {
        type: "p",
        text: "It also moves the burden of identification to the buyer. The part has to be matched to the vehicle by number and configuration, the condition has to be clear, and the freight has to be understood, because engines and transmissions are heavy and are often shipped as freight.",
      },
      { type: "h2", text: "Where DrivoraParts fits" },
      {
        type: "p",
        text: "DrivoraParts is one of the sellers working in this space. It lists specialty engines, transmissions, performance parts and truck and 4WD components, and it offers fitment assistance to customers who contact it with a VIN or part number before ordering. It does not claim automated verification or guaranteed fitment.",
      },
      {
        type: "note",
        text: "This is company editorial content published by DrivoraParts, not independent journalism. The external figures are quoted from the sources listed below and describe the wider market, not DrivoraParts.",
      },
    ],
    sources: [
      {
        label: "S&P Global Mobility, press release, May 21, 2025",
        url: "https://press.spglobal.com/2025-05-21-U-S-Vehicle-Age-Rises-Again-to-12-8-Years-in-2025,-According-to-S-P-Global-Mobility",
        note: "Average US light-vehicle age of 12.8 years; passenger cars 14.5 and light trucks 11.9.",
      },
      {
        label: "SEMA, 2026 SEMA Market Report",
        url: "https://www.sema.org/news-media/enews/2026/29/want-grow-your-aftermarket-business-start-2026-sema-market-report",
        note: "$52.92 billion in accessory and performance parts sales in 2025.",
      },
      {
        label: "US Census Bureau, Quarterly Retail E-Commerce Sales",
        url: "https://www.census.gov/retail/ecommerce.html",
        note: "E-commerce at 17.1 percent of total retail sales, Q2 2026, seasonally adjusted.",
      },
    ],
  },
  {
    slug: "cross-border-automotive-parts-sourcing",
    title: "DrivoraParts Builds a More Structured Approach to Cross-Border Automotive Parts Sourcing",
    excerpt:
      "Buying a heavy automotive part from another country involves more than the price. How identification, shipping quotes, payment and communication fit together, and why to confirm them before ordering.",
    category: "Shipping & Sourcing",
    datePublished: "2026-10-03",
    cover: {
      src: "/homepage/shipping/1600.webp",
      alt: "A long road crossing a desert landscape with mountains in the distance",
    },
    body: [
      {
        type: "p",
        text: "Buying a part from a seller in the same country is already a matter of getting the details right. Buying across a border adds more: different carriers, different charges and more people handling the order between the seller and the driveway.",
      },
      {
        type: "p",
        text: "DrivoraParts is set up to take orders from buyers in several markets. This article describes how it approaches an order that crosses borders, and what buyers should confirm before they commit.",
      },
      { type: "h2", text: "Domestic and international orders differ" },
      {
        type: "p",
        text: "A domestic order usually involves one carrier network, one set of rules and one postal system. An international order can involve export and import handling, customs inspection, and a delivery leg run by a different carrier from the one that collected the parcel.",
      },
      {
        type: "p",
        text: "Policies that are routine at home can behave differently abroad. The DrivoraParts Shipping Policy notes, for example, that customs inspections and incomplete or inaccurate address details can delay delivery.",
      },
      { type: "h2", text: "Step one: identify the part" },
      {
        type: "p",
        text: "Returning a heavy part internationally is slow and costly, so getting the part right the first time matters more across borders than within one. Check the VIN, OEM part number, engine code or transmission identification and the exact vehicle configuration against the listing.",
      },
      {
        type: "p",
        text: "Customers can contact DrivoraParts with a VIN or part number before ordering and ask for fitment assistance. It is help from the team, not automated verification, and fitment is not guaranteed.",
      },
      { type: "h2", text: "Step two: shipping is quoted per order" },
      {
        type: "p",
        text: "DrivoraParts does not price shipping automatically through a carrier connection. Shipping for an order is worked out for that order and sent to the customer with the payment details. The figure depends on the item, how it travels (parcel, multiple boxes or palletized freight) and the destination.",
      },
      {
        type: "p",
        text: "Engines, transmissions and other heavy or bulky items typically move as freight, which is priced differently from a parcel. Buyers should look at the quoted shipping cost before paying, not after.",
      },
      { type: "h2", text: "Step three: payment" },
      {
        type: "p",
        text: "Checkout at DrivoraParts offers manual payment methods, and cryptocurrency through NOWPayments as an additional option. For a manual payment, the order is reviewed first, the payment details are sent to the customer along with the shipping quote, and the order ships once the payment has been received and verified.",
      },
      {
        type: "p",
        text: "For international buyers that sequence is useful: the total, including shipping, is known before money moves.",
      },
      { type: "h2", text: "Step four: communication" },
      {
        type: "p",
        text: "Most problems with cross-border orders are communication problems: an unclear address, a missing phone number for the carrier, a question about fitment that was never asked. Customers can reach the team through the contact page, and an order can be followed through the order-tracking page.",
      },
      { type: "h2", text: "What to confirm before ordering" },
      {
        type: "ul",
        items: [
          "That the part matches your vehicle by VIN, part number and configuration.",
          "The shipping cost to your destination, and how the item will travel.",
          "Any import duties, taxes or customs charges that may apply in your country. These are set locally and are not part of the shipping quote.",
          "A complete delivery address and contact details.",
          "The return and warranty terms that apply to the listing.",
        ],
      },
      {
        type: "p",
        text: "None of this guarantees a particular outcome, and delivery can be affected by factors outside any seller's control. A structured process makes the surprises smaller and the decisions better informed.",
      },
      {
        type: "note",
        text: "This is company editorial content published by DrivoraParts. For the terms that apply to an order, see the Shipping Policy and the Returns & Refund Policy.",
      },
    ],
  },
];

export function getAllNewsArticles(): NewsArticle[] {
  return [...NEWS_ARTICLES].sort((a, b) =>
    a.datePublished < b.datePublished ? 1 : -1
  );
}

export function getNewsArticle(slug: string): NewsArticle | undefined {
  return NEWS_ARTICLES.find((article) => article.slug === slug);
}

export function getRelatedNewsArticles(slug: string, limit = 3): NewsArticle[] {
  return getAllNewsArticles()
    .filter((article) => article.slug !== slug)
    .slice(0, limit);
}

export function newsArticlePath(slug: string): string {
  return `${NEWS_PATH}/${slug}`;
}

export function formatNewsDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
