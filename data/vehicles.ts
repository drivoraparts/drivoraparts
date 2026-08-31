/* =========================================================
   DRIVORAPARTS — VEHICLE PLATFORMS (SYSTEM C)
   ---------------------------------------------------------
   A vehicle platform is NOT a product. It is a hub that
   gathers the parts we already stock for one 4x4 ute, the
   way /catalog/engine/[platform] gathers engines for one
   engine family.

   Nothing here is for sale. There is no price, no stock and
   no Add to Cart, because DrivoraParts sells parts, not
   vehicles. The listings exist so someone searching
   "Toyota HiLux 4x4 parts" lands on the parts we actually
   have rather than on nothing.

   ACCURACY RULE
   Generation codes, year ranges and body styles below are
   taken from published model histories and were verified
   when this file was written. Engine outputs, payload,
   towing and dimensions are deliberately ABSENT — those
   vary by market and model year, and a parts catalogue has
   no business asserting them.
========================================================= */

/** One structured fitment row. Every field is a documented model fact. */
export type VehicleFitment = {
  make: string;
  model: string;
  /** Manufacturer series / chassis code, e.g. "P703 (T6.2)", "RG01". */
  series: string;
  /** Model years this series covers. Open-ended when still in production. */
  yearsFrom: number;
  yearsTo?: number;
  /** Cab and body configurations offered on this series. */
  bodyStyles: string[];
  /** Drive configurations offered. */
  drive: string[];
  /** Only set where the variant is a documented, market-wide fact. */
  notes?: string;
};

export type VehiclePlatform = {
  /** URL slug — /vehicles/[slug]. */
  slug: string;
  /** Display name, used as the H1 and in the page title. */
  name: string;
  /** One-line positioning shown under the heading. */
  tagline: string;
  /** Manufacturer, for grouping and breadcrumbs. */
  make: string;
  /** Short description used on the index card and meta description. */
  summary: string;
  /** Long-form body copy. Paragraphs, rendered in order. */
  overview: string[];
  /** Structured fitment rows — one per series/generation we cover. */
  fitment: VehicleFitment[];
  /** Verified platform facts worth stating. Never performance figures. */
  highlights: string[];
  /**
   * Case-insensitive patterns matched against product name and fitment text
   * to gather this platform's parts from the live catalogue.
   */
  include: RegExp[];
  /** Patterns that must NOT match — guards against confusable models. */
  exclude?: RegExp[];
  /**
   * A platform this vehicle is mechanically derived from. Parts for the donor
   * frequently fit, but "frequently" is not "always", so the page says so
   * plainly rather than implying a guarantee.
   */
  sharedWith?: { slug: string; label: string; reason: string };
  /** SEO overrides. */
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
};

export const vehiclePlatforms: VehiclePlatform[] = [
  {
    slug: "ford-ranger-4x4",
    name: "Ford Ranger 4x4",
    tagline: "T6 and T6.2 · 2011–present",
    make: "Ford",
    summary:
      "Bull bars, lift kits, snorkels, canopies and roof racks for the Ford Ranger 4x4 — the T6 (PX) and current T6.2 (P703) generations.",
    overview: [
      "The Ford Ranger is one of the most heavily accessorised 4x4 utes in the world, and the aftermarket reflects that. Almost every major bar, suspension and touring brand supports it directly, which means fitment is usually a question of which generation you have rather than whether a part exists.",
      "The split that matters is 2022. Rangers built from May 2022 use the T6.2 platform (chassis code P703), which changed the front-end structure enough that bull bars, bumpers and some lift components are not interchangeable with the earlier PX/T6 trucks. Check your build date before ordering front-end hardware.",
      "Everything listed below is stock we hold or can source. If you cannot find the part you need for your Ranger, send us the chassis code and build year and we will tell you honestly whether it is something we can get.",
    ],
    fitment: [
      {
        make: "Ford",
        model: "Ranger",
        series: "P375 / PX, PX II, PX III (T6)",
        yearsFrom: 2011,
        yearsTo: 2022,
        bodyStyles: ["Single Cab", "Super Cab (extended)", "Double Cab", "Chassis Cab"],
        drive: ["4x4", "4x2"],
      },
      {
        make: "Ford",
        model: "Ranger",
        series: "P703 / RA (T6.2)",
        yearsFrom: 2022,
        bodyStyles: ["Single Cab", "Super Cab (extended)", "Double Cab", "Chassis Cab"],
        drive: ["4x4", "4x2"],
        notes:
          "Body and cab availability varies by market. North American Rangers are double cab only.",
      },
    ],
    highlights: [
      "Two distinct platforms — PX/T6 (2011–2022) and T6.2/P703 (2022–present)",
      "Front-end accessories are generation-specific and rarely interchangeable",
      "Shares its platform with the second-generation Volkswagen Amarok",
    ],
    include: [/\branger\b/i],
    /*
     * "Ranger" is not unique to Ford. The Polaris RZR / Ranger is a
     * side-by-side UTV, and a steering adapter for one matched this hub purely
     * on the word in its name — it carries no fitment text to contradict the
     * match. Anything matched on name alone is only as good as the name.
     */
    exclude: [/range\s?rover/i, /polaris/i, /\brzr\b/i],
    seoTitle: "Ford Ranger 4x4 Parts & Accessories",
    seoDescription:
      "Bull bars, lift kits, snorkels, canopies and roof racks for the Ford Ranger 4x4. PX/T6 and T6.2 (P703) fitment explained. Worldwide shipping from DrivoraParts.",
    keywords: [
      "ford ranger 4x4 parts",
      "ford ranger accessories",
      "ranger px bull bar",
      "ranger t6.2 lift kit",
      "ford ranger p703 snorkel",
      "ranger canopy",
    ],
  },
  {
    slug: "toyota-hilux-4x4",
    name: "Toyota HiLux 4x4",
    tagline: "AN120/AN130 and AN220/AN230 · 2015–present",
    make: "Toyota",
    summary:
      "Suspension, bar work, snorkels and touring gear for the Toyota HiLux 4x4 — the eighth-generation AN120/AN130 and the current AN220/AN230.",
    overview: [
      "The HiLux carries the deepest accessory support of any ute we stock, which is unsurprising for a vehicle that has been the default working 4x4 across Africa, Asia, Australia and the Middle East for decades.",
      "Most parts here target the eighth generation, built from 2015 and facelifted in 2017, 2020 and 2024. Toyota introduced the ninth generation (AN220/AN230) in 2025; parts support for it is still building across the aftermarket, so verify before ordering if yours is a 2025-or-later truck.",
      "HiLux fitment is usually straightforward, but the facelifts did change front bar mounting on some markets. If you are ordering a bull bar or front bumper, tell us the build year rather than just the model year.",
    ],
    fitment: [
      {
        make: "Toyota",
        model: "HiLux",
        series: "AN120 / AN130 (8th generation)",
        yearsFrom: 2015,
        yearsTo: 2025,
        bodyStyles: ["Single Cab", "Xtra Cab", "Double Cab", "Cab Chassis"],
        drive: ["4x4", "4x2"],
        notes: "Facelifted in 2017, 2020 and 2024. Front bar fitment can differ across facelifts.",
      },
      {
        make: "Toyota",
        model: "HiLux",
        series: "AN220 / AN230 (9th generation)",
        yearsFrom: 2025,
        bodyStyles: ["Single Cab", "Xtra Cab", "Double Cab", "Cab Chassis"],
        drive: ["4x4", "4x2"],
        notes: "Recent platform — aftermarket support is still expanding. Verify fitment before ordering.",
      },
    ],
    highlights: [
      "Eighth generation (2015–2025) has the widest parts support",
      "Three facelifts within the eighth generation can affect front bar fitment",
      "Ninth generation arrived 2025 — confirm fitment on newer trucks",
    ],
    include: [/hi-?lux/i],
    seoTitle: "Toyota HiLux 4x4 Parts & Accessories",
    seoDescription:
      "Lift kits, bull bars, snorkels and canopies for the Toyota HiLux 4x4. AN120/AN130 and AN220/AN230 fitment explained. Worldwide shipping from DrivoraParts.",
    keywords: [
      "toyota hilux 4x4 parts",
      "hilux accessories",
      "hilux lift kit",
      "hilux bull bar",
      "hilux snorkel",
      "hilux an120 parts",
    ],
  },
  {
    slug: "isuzu-d-max-4x4",
    name: "Isuzu D-Max 4x4",
    tagline: "RG01 · 2019–present",
    make: "Isuzu",
    summary:
      "Bar work, suspension, snorkels and canopies for the third-generation Isuzu D-Max 4x4 (RG01).",
    overview: [
      "The third-generation D-Max, launched in 2019 under the RG01 code, is the platform most of the current aftermarket targets. It is also the basis for the current Mazda BT-50, which is why parts often cross between the two.",
      "D-Max buyers tend to be working buyers, and the parts that move are the practical ones — bar work, load-carrying suspension, snorkels for dust and water, and canopies. That is reflected in what we stock.",
      "If you have a pre-2019 D-Max, say so when you enquire. The earlier generations are a different vehicle for fitment purposes and most of what is listed here will not fit.",
    ],
    fitment: [
      {
        make: "Isuzu",
        model: "D-Max",
        series: "RG01 (3rd generation)",
        yearsFrom: 2019,
        bodyStyles: [
          "Single Cab",
          "Extended Cab (clamshell rear doors)",
          "Double Cab",
        ],
        drive: ["4x4", "4x2"],
      },
    ],
    highlights: [
      "Third generation (RG01) from 2019 — the platform current parts target",
      "Shares its underpinnings with the third-generation Mazda BT-50",
      "Extended cab uses rear clamshell doors, which affects some rack and canopy fitment",
    ],
    include: [/d-?max/i],
    seoTitle: "Isuzu D-Max 4x4 Parts & Accessories",
    seoDescription:
      "Bull bars, lift kits, snorkels and canopies for the Isuzu D-Max 4x4 (RG01, 2019+). Fitment by cab configuration. Worldwide shipping from DrivoraParts.",
    keywords: [
      "isuzu d-max 4x4 parts",
      "d-max accessories",
      "d-max rg01 bull bar",
      "isuzu d-max lift kit",
      "d-max snorkel",
      "d-max canopy",
    ],
  },
  {
    slug: "mitsubishi-triton-4x4",
    name: "Mitsubishi Triton 4x4",
    tagline: "LC / MV · 2023–present · also sold as L200 and Strada",
    make: "Mitsubishi",
    summary:
      "Front bars, suspension and touring hardware for the Mitsubishi Triton 4x4 — sold as the L200 and Strada in many markets.",
    overview: [
      "The Triton is the same vehicle as the Mitsubishi L200 and the Mitsubishi Strada; the name changes by market, the truck does not. If you are searching under a different name, you are in the right place.",
      "The current sixth generation arrived in 2023, using chassis code LC in most markets and MV in Australia. Parts support is still growing relative to the HiLux and Ranger, so our range here is narrower — we would rather list what genuinely fits than pad the page.",
      "One thing worth knowing: from 2026 this platform is also being sold as the Nissan Navara (D27). If you own that truck, Triton parts are the ones to look at.",
    ],
    fitment: [
      {
        make: "Mitsubishi",
        model: "Triton / L200 / Strada",
        series: "LC (global) · MV (Australia) — 6th generation",
        yearsFrom: 2023,
        bodyStyles: ["Single Cab", "Double Cab", "Mega Cab (Thailand)"],
        drive: ["4x4", "4x2"],
        notes: "Marketed as L200 in most export markets and Strada in parts of Asia.",
      },
    ],
    highlights: [
      "Sold as Triton, L200 and Strada depending on market — same vehicle",
      "Sixth generation from 2023 (LC globally, MV in Australia)",
      "Also rebadged as the Nissan Navara D27 from 2026",
    ],
    include: [/triton/i, /\bl200\b/i, /mitsubishi\s+strada/i],
    seoTitle: "Mitsubishi Triton 4x4 Parts & Accessories",
    seoDescription:
      "Bull bars, suspension and touring parts for the Mitsubishi Triton 4x4, also sold as the L200 and Strada. Sixth-generation LC/MV fitment. DrivoraParts.",
    keywords: [
      "mitsubishi triton 4x4 parts",
      "triton accessories",
      "mitsubishi l200 parts",
      "triton mv bull bar",
      "triton lift kit",
      "mitsubishi strada parts",
    ],
  },
  {
    slug: "byd-shark-6-phev",
    name: "BYD Shark 6 Plug-in Hybrid",
    tagline: "DMO Super Hybrid platform · 2024–present",
    make: "BYD",
    summary:
      "Platform reference for the BYD Shark 6 plug-in hybrid ute. We do not yet stock parts for this vehicle — tell us what you need and we will source it.",
    overview: [
      "The BYD Shark 6 is a plug-in hybrid ute built on BYD's DMO Super Hybrid platform, using a body-on-frame chassis with a turbocharged petrol engine and dual electric motors driving all four wheels. It launched in Mexico in May 2024 and has since reached Australia, Brazil and several Asian markets. In China it is sold under the Fangchengbao brand as the Fangchengbao Shark.",
      "We are being straight with you: we do not currently stock parts for the Shark 6. It is a new platform and the accessory aftermarket is only starting to form around it. Listing parts we do not have would waste your time.",
      "What we can do is source. If you need something specific for a Shark 6, send us the part and your build details and we will tell you honestly whether we can get it and what it will cost.",
    ],
    fitment: [
      {
        make: "BYD",
        model: "Shark 6",
        series: "DMO Super Hybrid (body-on-frame)",
        yearsFrom: 2024,
        bodyStyles: ["Double Cab Pickup", "Cab Chassis"],
        drive: ["AWD (dual motor)"],
        notes:
          "Plug-in hybrid: turbocharged petrol engine with dual electric motors. Sold as Fangchengbao Shark in China.",
      },
    ],
    highlights: [
      "Plug-in hybrid ute — turbo petrol engine plus dual electric motors",
      "Body-on-frame chassis on BYD's DMO Super Hybrid platform",
      "New platform — aftermarket parts support is still emerging",
    ],
    include: [/byd\s+shark/i, /shark\s*6/i, /fangchengbao/i],
    seoTitle: "BYD Shark 6 Plug-in Hybrid — Parts Sourcing",
    seoDescription:
      "BYD Shark 6 plug-in hybrid ute platform reference and parts sourcing. DMO Super Hybrid, 2024 onward. Tell DrivoraParts what you need and we will source it.",
    keywords: [
      "byd shark 6 parts",
      "byd shark accessories",
      "shark 6 plug-in hybrid",
      "byd ute parts",
      "fangchengbao shark",
    ],
  },
  {
    slug: "mazda-bt-50-4x4",
    name: "Mazda BT-50 4x4",
    tagline: "TF · 2020–present",
    make: "Mazda",
    summary:
      "Parts for the third-generation Mazda BT-50 4x4 (TF) — built on the Isuzu D-Max platform, so D-Max parts frequently cross over.",
    overview: [
      "The current BT-50, coded TF and built from 2020, is developed from the third-generation Isuzu D-Max and assembled alongside it at Isuzu's plant in Samut Prakan, Thailand. Earlier BT-50s were Ford-based; this one is not, and that changes which parts fit.",
      "Because of the shared platform, a great deal of D-Max hardware fits the BT-50 — but not all of it. Body panels, grilles and anything that follows Mazda's own front-end styling are specific to the BT-50. Chassis-mounted parts such as suspension and many bar systems cross over far more readily.",
      "We hold fewer BT-50-specific listings than D-Max ones. Rather than leave this page thin, we point you at the D-Max range below, with the honest caveat that you should confirm fitment with us before ordering.",
    ],
    fitment: [
      {
        make: "Mazda",
        model: "BT-50",
        series: "TF (3rd generation)",
        yearsFrom: 2020,
        bodyStyles: [
          "Single Cab",
          "Extended Cab (clamshell rear doors)",
          "Double Cab",
        ],
        drive: ["4x4", "4x2"],
        notes: "Developed from the third-generation Isuzu D-Max (RG01).",
      },
    ],
    highlights: [
      "Third generation (TF) from 2020, built on the Isuzu D-Max platform",
      "Chassis parts often cross from the D-Max; body and front-end panels do not",
      "Earlier Ford-based BT-50 generations take entirely different parts",
    ],
    include: [/bt-?50/i],
    sharedWith: {
      slug: "isuzu-d-max-4x4",
      label: "Isuzu D-Max (RG01)",
      reason:
        "The BT-50 TF is developed from the third-generation D-Max, so chassis-mounted parts frequently fit both. Body panels and front-end styling parts do not cross over. Confirm fitment with us before ordering.",
    },
    seoTitle: "Mazda BT-50 4x4 Parts & Accessories",
    seoDescription:
      "Parts for the Mazda BT-50 4x4 (TF, 2020+), built on the Isuzu D-Max platform. Cross-platform fitment explained honestly. DrivoraParts.",
    keywords: [
      "mazda bt-50 parts",
      "bt-50 accessories",
      "bt-50 tf snorkel",
      "mazda bt-50 lift kit",
      "bt-50 d-max parts",
    ],
  },
  {
    slug: "toyota-landcruiser-70-series",
    name: "Toyota LandCruiser 70 Series",
    tagline: "VDJ76 wagon · VDJ78 Troop Carrier · VDJ79 cab-chassis & pickup",
    make: "Toyota",
    summary:
      "Suspension, bar work and snorkels for the LandCruiser 70 Series — with the 76, 78 and 79 body codes kept separate, because they are not the same vehicle.",
    overview: [
      "The 70 Series is not one vehicle, and treating it as one is how people order parts that do not fit. The 76 is a four-door wagon, the 78 is the Troop Carrier, and the 79 is the cab-chassis and pickup — single cab and double cab. Suspension, in particular, differs between them because the loads and wheelbases differ.",
      "Most of what we stock for the 70 Series targets the 79 — the working ute configuration, and the one most often fitted with bar work, load-rated suspension and snorkels.",
      "The 70 Series has been in continuous production for decades with periodic updates, including the 2.8L 1GD-FTV diesel and automatic transmission option added in 2023. When you enquire, give us the body code and build year rather than just the year.",
    ],
    fitment: [
      {
        make: "Toyota",
        model: "LandCruiser 79 Series",
        series: "VDJ79 — cab-chassis and pickup",
        yearsFrom: 2007,
        bodyStyles: ["Single Cab-Chassis", "Double Cab-Chassis", "Pickup"],
        drive: ["4x4"],
        notes: "Double-cab models share the 79 designation. Most 70 Series parts we stock target this body.",
      },
      {
        make: "Toyota",
        model: "LandCruiser 76 Series",
        series: "VDJ76 — wagon",
        yearsFrom: 2007,
        bodyStyles: ["4-door Wagon"],
        drive: ["4x4"],
      },
      {
        make: "Toyota",
        model: "LandCruiser 78 Series",
        series: "VDJ78 — Troop Carrier",
        yearsFrom: 2007,
        bodyStyles: ["3-door Troop Carrier"],
        drive: ["4x4"],
      },
    ],
    highlights: [
      "76, 78 and 79 are different bodies — suspension and bar fitment differ",
      "79 Series covers single and double cab-chassis and pickup",
      "2.8L 1GD-FTV diesel with automatic added to the range in 2023",
    ],
    include: [
      /land\s?cruiser\s*7[689]/i,
      /\b7[689]\s*series/i,
      /land\s?cruiser\s*70/i,
    ],
    exclude: [/prado/i, /\b(100|200|300)\s*series/i, /land\s?cruiser\s*(100|200|300)/i],
    seoTitle: "Toyota LandCruiser 70 Series Parts — 76, 78 & 79",
    seoDescription:
      "Suspension, bull bars and snorkels for the Toyota LandCruiser 70 Series. VDJ79 cab-chassis and pickup, VDJ76 wagon, VDJ78 Troop Carrier. DrivoraParts.",
    keywords: [
      "landcruiser 70 series parts",
      "landcruiser 79 series parts",
      "vdj79 suspension",
      "landcruiser 76 wagon parts",
      "troop carrier 78 series",
      "70 series bull bar",
    ],
  },
  {
    slug: "nissan-navara-4x4",
    name: "Nissan Navara 4x4",
    tagline: "D23 / NP300 · 2014–present",
    make: "Nissan",
    summary:
      "Front bars, suspension and touring parts for the Nissan Navara 4x4 — the D23/NP300 generation.",
    overview: [
      "Almost everything we stock for the Navara targets the D23, also sold as the NP300, in production since 2014 and facelifted since. It is offered as a single cab, king cab and dual cab, with short and long bed options.",
      "Nissan introduced a fourth-generation Navara (D27) in December 2025. That truck is a rebadged Mitsubishi Triton rather than a development of the D23, so it takes Triton parts, not Navara parts. If you own a D27, look at our Triton platform page instead.",
      "That distinction catches people out, so check which generation you have before ordering — the model name is the same but the vehicle underneath is not.",
    ],
    fitment: [
      {
        make: "Nissan",
        model: "Navara / NP300",
        series: "D23 (3rd generation)",
        yearsFrom: 2014,
        bodyStyles: ["Single Cab", "King Cab", "Dual Cab"],
        drive: ["4x4", "4x2"],
        notes: "Short and long bed options available across variants.",
      },
      {
        make: "Nissan",
        model: "Navara",
        series: "D27 (4th generation)",
        yearsFrom: 2025,
        bodyStyles: ["Dual Cab"],
        drive: ["4x4", "4x2"],
        notes:
          "A rebadged Mitsubishi Triton — takes Triton parts, not D23 Navara parts.",
      },
    ],
    highlights: [
      "D23 / NP300 from 2014 is the generation our parts target",
      "D27 (2025 onward) is a rebadged Mitsubishi Triton — different parts entirely",
      "Single, king and dual cab bodies with short and long bed options",
    ],
    include: [/navara/i, /np-?300/i],
    seoTitle: "Nissan Navara 4x4 Parts & Accessories",
    seoDescription:
      "Bull bars, suspension and touring parts for the Nissan Navara 4x4 (D23/NP300, 2014+). D23 versus D27 fitment explained. DrivoraParts.",
    keywords: [
      "nissan navara 4x4 parts",
      "navara np300 accessories",
      "navara d23 bull bar",
      "navara lift kit",
      "np300 snorkel",
    ],
  },
  {
    slug: "gwm-cannon",
    name: "GWM Cannon",
    tagline: "Including Cannon Alpha · 2019–present",
    make: "GWM",
    summary:
      "Platform reference for the GWM Cannon and Cannon Alpha. Our GWM stock is currently limited — tell us what you need and we will source it.",
    overview: [
      "The GWM Cannon is sold under a spread of names depending on market — GWM Poer (P11/P12), P-Series, Ruman and Sucan among them. It has been in production since 2019 in single cab, extended cab and double cab configurations, with rear-wheel drive, four-wheel drive and an electric variant.",
      "The Cannon Alpha is a separate, larger variant in the range; a 2.4-litre diesel was added to the Australian Cannon Alpha line-up with the 2025 facelift.",
      "We will be direct: our GWM stock is currently limited to the Tank 300, which is a different vehicle — an SUV, not the Cannon ute. We do not want to imply otherwise. If you need Cannon or Cannon Alpha parts, send us the specifics and we will source them rather than sell you something that does not fit.",
    ],
    fitment: [
      {
        make: "GWM",
        model: "Cannon / Poer / P-Series",
        series: "P11 / P12",
        yearsFrom: 2019,
        bodyStyles: ["Single Cab", "Extended Cab", "Double Cab"],
        drive: ["4x4", "4x2", "RWD (electric variant)"],
        notes:
          "Sold as GWM Poer, P-Series, Ruman or Sucan depending on market.",
      },
      {
        make: "GWM",
        model: "Cannon Alpha",
        series: "Cannon Alpha",
        yearsFrom: 2023,
        bodyStyles: ["Double Cab"],
        drive: ["4x4"],
        notes:
          "A 2.4-litre diesel joined the Australian Cannon Alpha range with the 2025 facelift.",
      },
    ],
    highlights: [
      "Sold as Cannon, Poer, P-Series, Ruman or Sucan by market",
      "Cannon Alpha is a separate, larger model in the range",
      "Our current GWM stock is Tank 300 only — a different vehicle",
    ],
    include: [/gwm\s+cannon/i, /cannon\s+alpha/i, /\bgwm\s+poer\b/i, /great\s?wall\s+(pao|poer)/i],
    exclude: [/tank\s*300/i],
    seoTitle: "GWM Cannon & Cannon Alpha — Parts Sourcing",
    seoDescription:
      "GWM Cannon and Cannon Alpha platform reference and parts sourcing. Also sold as GWM Poer and P-Series. Tell DrivoraParts what you need and we will source it.",
    keywords: [
      "gwm cannon parts",
      "cannon alpha accessories",
      "gwm poer parts",
      "gwm ute accessories",
      "gwm p-series parts",
    ],
  },
  {
    slug: "volkswagen-amarok-4x4",
    name: "Volkswagen Amarok 4x4",
    tagline: "2H and NF · 2010–present",
    make: "Volkswagen",
    summary:
      "Parts for the Volkswagen Amarok 4x4. The current NF generation shares the Ford Ranger platform, so Ranger parts frequently cross over.",
    overview: [
      "There are two very different Amaroks. The first generation (2H), built from 2010, is Volkswagen's own design. The second generation (NF), from 2022, is built on the Ford Ranger T6.2 platform under the Ford–VW alliance, and assembled alongside the Ranger at Ford's Silverton plant in South Africa.",
      "That matters enormously for parts. If you have an NF Amarok, a great deal of Ranger T6.2 hardware fits — particularly chassis-mounted suspension and many bar systems. Body panels, grilles and anything shaped to Volkswagen's own styling do not cross over.",
      "Our Amarok-specific range is small — only a handful of listings name the Amarok in their fitment. Rather than leave it at that, we also show the Ranger range below, with the honest caveat that it applies to the NF generation and that you should confirm fitment with us before ordering.",
    ],
    fitment: [
      {
        make: "Volkswagen",
        model: "Amarok",
        series: "NF (2nd generation)",
        yearsFrom: 2022,
        bodyStyles: ["Single Cab", "Double Cab"],
        drive: ["4motion 4x4", "RWD"],
        notes: "Built on the Ford Ranger T6.2 platform at Ford's Silverton plant.",
      },
      {
        make: "Volkswagen",
        model: "Amarok",
        series: "2H (1st generation)",
        yearsFrom: 2010,
        yearsTo: 2020,
        bodyStyles: ["Single Cab", "Double Cab"],
        drive: ["4motion 4x4", "RWD"],
        notes: "Volkswagen's own platform — does not share Ranger parts. Production continued in Argentina.",
      },
    ],
    highlights: [
      "Second generation (NF, 2022+) is built on the Ford Ranger T6.2 platform",
      "First generation (2H, 2010–2020) is a different platform entirely",
      "Ranger chassis parts often fit the NF; body and styling panels do not",
    ],
    include: [/amarok/i],
    sharedWith: {
      slug: "ford-ranger-4x4",
      label: "Ford Ranger (T6.2 / P703)",
      reason:
        "The second-generation Amarok (NF) is built on the Ford Ranger T6.2 platform, so chassis-mounted parts frequently fit both. This does not apply to the first-generation 2H Amarok, and body panels never cross over. Confirm fitment with us before ordering.",
    },
    seoTitle: "Volkswagen Amarok 4x4 Parts & Accessories",
    seoDescription:
      "Parts for the Volkswagen Amarok 4x4. The NF generation shares the Ford Ranger T6.2 platform — cross-platform fitment explained honestly. DrivoraParts.",
    keywords: [
      "volkswagen amarok parts",
      "amarok 4x4 accessories",
      "amarok nf lift kit",
      "vw amarok bull bar",
      "amarok ranger parts",
    ],
  },

  {
    slug: "ford-obs-73-power-stroke",
    name: "Ford OBS F-250 / F-350 — 7.3L Power Stroke",
    tagline: "1994.5–1997 · Old Body Style · 7.3L Power Stroke diesel",
    make: "Ford",
    summary:
      "Parts for the 1994.5–1997 OBS F-250 and F-350 with the 7.3L Power Stroke — kept strictly apart from the 7.3 IDI, the 1999.5–2003 Super Duty, and the 2020+ 7.3 Godzilla petrol V8.",
    overview: [
      "Four different Ford engines get called \"7.3\", and only one of them is this truck's. The 7.3 IDI that came before it is indirect-injection with no HEUI system at all. The 1999.5–2003 Power Stroke that came after it is a Super Duty, a different body and a different turbocharger. And the 2020+ 7.3 \"Godzilla\" is a petrol V8 that shares nothing but a displacement figure. Parts do not cross between any of them, and ordering the wrong one is the single most common mistake on this platform.",
      "The OBS truck is the 1994.5–1997 F-250 and F-350: Old Body Style, the last of the ninth-generation F-Series before the Super Duty split off. The 7.3L Power Stroke arrived partway through 1994 as Ford's first HEUI direct-injection diesel, rated at 210 hp and 425 lb-ft, rising to 225 hp and 450 lb-ft by 1997. Behind it you will find either the ZF S5-42 or S5-47 five-speed manual, or the E4OD automatic.",
      "Two components split by year within this generation, and both catch people out. The high-pressure oil pump changed for 1996: 1994–1995 trucks use the HP004X with the anti-drainback check valve inside the pump, while 1996–1997 uses the HP005X and a redesigned front timing cover. And the factory turbocharger, the TP38, applies to engine serial numbers up to 661,973 — check yours before ordering.",
    ],
    fitment: [
      {
        make: "Ford",
        model: "F-250 / F-350",
        series: "OBS (Old Body Style) — ninth-generation F-Series",
        yearsFrom: 1994,
        yearsTo: 1997,
        bodyStyles: [
          "Regular Cab",
          "SuperCab",
          "Crew Cab",
          "Chassis Cab",
          "Dual Rear Wheel (DRW)",
        ],
        drive: ["4x4", "4x2"],
        notes:
          "7.3L Power Stroke diesel (HEUI) from partway through 1994 — commonly written 1994.5. Transmissions: ZF S5-42 / S5-47 five-speed manual, or E4OD automatic.",
      },
    ],
    highlights: [
      "7.3L Power Stroke (HEUI) — not the 7.3 IDI, the 1999.5–2003, or the 2020+ Godzilla",
      "HPOP splits by year: HP004X for 1994–1995, HP005X for 1996–1997 — not interchangeable",
      "TP38 turbocharger covers engine serials up to 661,973",
      "Injectors are AA single-shot; the AB split-shot belongs to 1997 California and early 1999",
    ],
    include: [
      /\bobs\b[^|]{0,40}7\.3/i,
      /7\.3[^|]{0,40}\bobs\b/i,
      /\bTP38\b/i,
      /HP00[45]X/i,
      /AP63800AA/i,
      /F6TZ|F81Z-9E527/i,
    ],
    /*
     * Deliberately no exclusions.
     *
     * The obvious ones — GTP38, Godzilla, 1999.5–2003 — all backfired, because
     * these listings name those engines in their fitment precisely to say they
     * do NOT fit. An exclusion cannot tell a disclaimer from a claim, so
     * excluding "Godzilla" removed the very turbocharger whose fitment warns
     * against buying a Godzilla part.
     *
     * The includes carry the weight instead, and are specific enough alone:
     * "GTP38R" has no word boundary before TP38 so /\bTP38\b/ skips it, and no
     * Godzilla or 1999.5–2003 listing contains "OBS" next to 7.3, an HP00xX
     * code, or a Ford F6TZ/F81Z part number. Verified against the whole
     * catalogue: exactly the three OBS listings match.
     */
    seoTitle: "OBS Ford 7.3 Power Stroke Parts — 1994.5–1997 F-250 & F-350",
    seoDescription:
      "Parts for the 1994.5–1997 OBS Ford F-250 and F-350 7.3L Power Stroke. TP38 turbo, HPOP, injectors and ZF5 fitment, kept separate from the IDI, 1999.5–2003 and Godzilla 7.3.",
    keywords: [
      "obs 7.3 powerstroke parts",
      "obs ford 7.3 parts",
      "1994 f250 7.3 powerstroke parts",
      "1996 f250 7.3 powerstroke parts",
      "1997 f350 7.3 powerstroke parts",
      "7.3 powerstroke tp38 turbo",
      "7.3 powerstroke hpop",
      "zf5 7.3 powerstroke",
    ],
  },
];

export function getVehiclePlatform(slug: string): VehiclePlatform | undefined {
  return vehiclePlatforms.find((v) => v.slug === slug);
}

/** Renders a fitment row's year span as "2019–present" / "2011–2022". */
export function fitmentYears(row: VehicleFitment): string {
  return row.yearsTo ? `${row.yearsFrom}–${row.yearsTo}` : `${row.yearsFrom}–present`;
}
