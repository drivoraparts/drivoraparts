import type { Product } from "@/lib/inventory/types";
import { products } from "@/lib/inventory/products";

type ProductKind =
  | "engine"
  | "turbo"
  | "transmission"
  | "brakes"
  | "exhaust"
  | "body-bed"
  | "body-shell"
  | "lighting"
  | "interior"
  | "generic";

type ReviewContext = {
  item: string;
  kind: ProductKind;
  brand?: string;
};

type Rating = 1 | 2 | 3 | 4 | 5;

const BRAND_LABELS: Record<string, string> = {
  bmw: "BMW",
  toyota: "Toyota",
  nissan: "Nissan",
  ford: "Ford",
  chevrolet: "Chevy",
  dodge: "Ram",
  gmc: "GMC",
  mercedes: "Mercedes",
  audi: "Audi",
  universal: "",
};

function inferKind(product: Product): ProductKind {
  const hay = `${product.name} ${product.category} ${product.platform ?? ""} ${
    product.description?.slice(0, 240) ?? ""
  }`.toLowerCase();

  if (/turbocharger|turbo kit|supercharger|wastegate|blow-off|intercooler/.test(hay)) {
    return "turbo";
  }
  if (/transmission|gearbox|clutch kit|dsg|zf|tremec|torque converter|shifter/.test(hay)) {
    return "transmission";
  }
  if (/brake kit|caliper|rotor|pad kit|big brake|wilwood|ebc|ate brake/.test(hay)) {
    return "brakes";
  }
  if (/catalytic|exhaust|muffler|header|downpipe|midpipe|pipe/.test(hay)) {
    return "exhaust";
  }
  if (/truck bed|short bed|long bed|8ft|6\.5|pickup bed|bed replacement|6'|8'/.test(hay)) {
    return "body-bed";
  }
  if (/camper|shell|topper|canopy|cap|fiberglass box|bed cap/.test(hay)) {
    return "body-shell";
  }
  if (/tail light|headlight|led|light bar|fog light|blind spot/.test(hay)) {
    return "lighting";
  }
  if (/seat|interior|carpet|dash|steering wheel|console/.test(hay)) {
    return "interior";
  }
  if (/engine|motor|crate|swap|block|long block|short block/.test(hay)) {
    return "engine";
  }
  if (product.category === "engine") return "engine";
  if (product.category === "transmission") return "transmission";
  if (product.category === "turbocharger") return "turbo";
  if (product.category === "bumper") return "body-bed";
  if (product.category === "canopy") return "body-bed";
  if (product.category === "body-parts") return "body-bed";
  if (product.category === "lighting") return "lighting";
  if (product.category === "interior") return "interior";
  return "generic";
}

function buildShortLabel(product: Product, kind: ProductKind): string {
  const name = product.name;

  const engineCode = name.match(
    /\b(N54|N55|S55|S58|B58|2JZ|1JZ|1UZ|4G63|RB26|VR38|LS[0-9]|LT[0-9]|Hemi|Coyote|K20|B16|EJ25|FA20|VQ35|VR6)\b/i
  );
  if (engineCode) return engineCode[1].toUpperCase();

  if (kind === "turbo") {
    const turbo = name.match(/(GTX?\d+[A-Z0-9]*|GT\d+[A-Z0-9]*|Garrett [A-Za-z0-9 ]+)/i);
    if (turbo) return turbo[0].trim();
    return "turbo";
  }

  if (kind === "transmission") {
    const trans = name.match(
      /(4L60E|6L80|6L90|8HP\d+|DQ500|TR6060|T56|CD009|10R80|722\.9|R154|V160|Getrag)/i
    );
    if (trans) return trans[0].toUpperCase();
    return "transmission";
  }

  if (kind === "body-bed") {
    if (/silverado|chevy/i.test(name)) return "Silverado bed";
    if (/f-?150|f150/i.test(name)) return "F-150 bed";
    if (/f-?250|f250|super duty/i.test(name)) return "Super Duty bed";
    if (/ram|dodge/i.test(name)) return "Ram bed";
    if (/sierra|gmc/i.test(name)) return "Sierra bed";
    return "truck bed";
  }

  if (kind === "body-shell") {
    if (/leer/i.test(name)) return "Leer topper";
    if (/are/i.test(name)) return "ARE shell";
    return "camper shell";
  }

  if (kind === "exhaust") {
    if (/catalytic/i.test(name)) return "catalytic converter";
    if (/pipe/i.test(name)) return "exhaust pipes";
    return "exhaust section";
  }

  if (kind === "brakes") return "brake kit";
  if (kind === "lighting") return "light assembly";

  const cleaned = name
    .replace(/\b(for sale|near me|replacement|direct-fit|compatible with)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").slice(0, 5).join(" ");
  if (words.length <= 42) return words;
  return `${words.slice(0, 39).trim()}…`;
}

function buildReviewContext(product: Product): ReviewContext {
  const kind = inferKind(product);
  return {
    item: buildShortLabel(product, kind),
    kind,
    brand: BRAND_LABELS[product.brand] || undefined,
  };
}

function fill(template: string, ctx: ReviewContext): string {
  return template.replace(/\{item\}/g, ctx.item).replace(/\{brand\}/g, ctx.brand ?? "");
}

const SHARED: Record<Rating, string[]> = {
  5: [
    "Exactly what the listing showed for the {item} — no surprises when it arrived.",
    "Photos matched the {item} we received. Happy with this buy.",
    "Solid purchase. The {item} looked like the ad and worked as expected.",
  ],
  4: [
    "Good {item} overall — minor cosmetic stuff only, function is fine.",
    "Happy with the {item}. Took a little extra time to verify fitment notes.",
    "Would buy again. The {item} is close to what I expected from the photos.",
  ],
  3: [
    "The {item} does what I needed. Not perfect, not a problem either.",
    "Decent {item} for the money — about what the listing suggested.",
    "Works fine. I would've liked one extra detail photo in the listing.",
  ],
  2: [
    "Small cosmetic thing on the {item} that wasn't super obvious in the pics — still usable.",
    "The {item} is okay. Support took an extra message to clarify one detail.",
    "Function is fine on the {item}; finish just wasn't quite as clean as I hoped.",
  ],
  1: [
    "Wish the listing had called out one tiny cosmetic spot on the {item} — still kept it.",
    "Had to ask one follow-up question about the {item}, but it worked out.",
    "Not a home run, but the {item} was usable for my project.",
  ],
};

const KIND_TEMPLATES: Partial<Record<ProductKind, Record<Rating, string[]>>> = {
  engine: {
    5: [
      "Compression and leak-down on this {item} looked good before we bolted it in.",
      "Block and accessories on the {item} matched the listing — fired after break-in.",
      "Shop was impressed with how clean the {item} looked on the stand.",
      "Swap project {item} — everything in the photos was there when we unboxed it.",
    ],
    4: [
      "Strong {item}. Valve cover had a little wear but nothing that affected the install.",
      "Good runner. We double-checked timing marks on the {item} before buttoning up.",
      "Happy with the {item} — would've liked one more angle in the listing photos.",
    ],
    3: [
      "The {item} runs fine. Expected slightly cleaner cosmetics for the price.",
      "Usable {item} for the build. Took extra time to verify sensor harness routing.",
    ],
    2: [
      "Minor surface rust on the {item} that wasn't obvious in one photo — still ran.",
      "The {item} needed one extra gasket from the local parts store — otherwise fine.",
    ],
    1: [
      "Had to confirm one accessory bracket on the {item} with support — sorted quickly.",
    ],
  },
  turbo: {
    5: [
      "Compressor and turbine on this {item} looked clean — no shaft play when we checked.",
      "The {item} spooled smooth on first pull. Matches the listing specs.",
      "Exactly the {item} I wanted for this setup — flanges looked good out of the box.",
    ],
    4: [
      "Good {item}. Housing had a tiny mark but wheel spun freely.",
      "Happy with the {item} — just double-checked oil feed line sizing before install.",
    ],
    3: [
      "The {item} works. Expected a bit more polish on the exterior finish.",
    ],
    2: [
      "Small cosmetic scuff on the {item} housing — function checked out fine.",
    ],
    1: [
      "Asked one question about flange orientation on the {item} — answer was quick.",
    ],
  },
  transmission: {
    5: [
      "Shifted through all gears on the {item} before install — felt tight and clean.",
      "The {item} looked like the photos — no obvious leaks on the case.",
      "Good {item} for the swap. Tail housing and bellhousing matched our measurements.",
    ],
    4: [
      "Solid {item}. Pan had some staining but internals felt good on the spin test.",
      "Happy with this {item} — took extra time to confirm speed sensor location.",
    ],
    3: [
      "The {item} shifts fine. Cosmetics were a little rougher than the hero photo.",
    ],
    2: [
      "One bolt hole on the {item} needed a light chase — otherwise installed normally.",
    ],
    1: [
      "Needed one clarification on converter specs for the {item} — support helped.",
    ],
  },
  brakes: {
    5: [
      "Rotors and calipers on this {item} matched the listing — bed-in went smooth.",
      "The {item} bolted up clean. Pedal feel improved right away.",
      "Good {item} for the money — hardware kit was complete.",
    ],
    4: [
      "Happy with the {item}. Rotors had light storage haze but cleaned up fine.",
    ],
    3: [
      "The {item} stops well. Finish on the calipers wasn't as glossy as the photos.",
    ],
    2: [
      "One pad clip on the {item} needed a slight bend — pads seated fine after.",
    ],
    1: [
      "Asked which way the {item} pads oriented — quick reply from support.",
    ],
  },
  exhaust: {
    5: [
      "Flanges on this {item} looked square — gaskets sealed on the first try.",
      "The {item} matched the listing photos. No rattles after heat cycle.",
      "Good {item} — welds looked clean and the fit was close to factory.",
    ],
    4: [
      "Solid {item}. One flange face had light discoloration but sealed fine.",
      "Happy with the {item} — took an extra minute to clock the pipes correctly.",
    ],
    3: [
      "The {item} fits and works. Expected slightly brighter finish in person.",
    ],
    2: [
      "Minor scratch on the {item} that didn't show in every photo — still sealed up.",
    ],
    1: [
      "Wanted to confirm inlet diameter on the {item} before welding — got a fast answer.",
    ],
  },
  "body-bed": {
    5: [
      "Bed floor and rails on this {item} looked straight — exactly like the listing shots.",
      "The {item} showed up as pictured. Tailgate gap looked good once we mocked it up.",
      "Good {item} for the project — bed sides were cleaner than I expected.",
    ],
    4: [
      "Solid {item}. Small paint fade on one rail but structure looked good.",
      "Happy with the {item} — measured bed length twice before freight pickup.",
    ],
    3: [
      "The {item} is usable. A couple scuffs that weren't in every listing angle.",
    ],
    2: [
      "One corner on the {item} had a little more wear than the close-up photo showed.",
    ],
    1: [
      "Asked about bed bolt pattern on the {item} before pickup — clear answer.",
    ],
  },
  "body-shell": {
    5: [
      "Glass and latches on this {item} worked — matched the listing condition.",
      "The {item} lined up on the bed rails like the photos suggested.",
      "Good {item}. No cracks in the fiberglass that we could find.",
    ],
    4: [
      "Happy with the {item}. Rear window had light haze but opened fine.",
    ],
    3: [
      "The {item} fits. Interior headliner could use a clean but structure is fine.",
    ],
    2: [
      "Small chip in the gel coat on the {item} — not visible in every photo.",
    ],
    1: [
      "Confirmed clamp kit compatibility for the {item} — support was helpful.",
    ],
  },
  lighting: {
    5: [
      "Plugged in the {item} — all LEDs worked and the lens was clear.",
      "The {item} matched the listing. Blind-spot function worked on first test.",
    ],
    4: [
      "Good {item}. Housing had light scuffing but bulbs and connectors were fine.",
    ],
    3: [
      "The {item} works. Lens clarity was a touch below the hero photo.",
    ],
    2: [
      "One mounting tab on the {item} needed a minor trim — light works great now.",
    ],
    1: [
      "Asked which connector the {item} uses — got the right answer before install.",
    ],
  },
};

function buildPool(ctx: ReviewContext, rating: Rating): string[] {
  const kindPool = KIND_TEMPLATES[ctx.kind]?.[rating] ?? [];
  const shared = SHARED[rating];
  return [...kindPool, ...shared].map((line) => fill(line, ctx));
}

function shuffleWithRng<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildProductComments(
  productId: number,
  count: number,
  ratings: Rating[],
  rng: () => number
): string[] {
  const product = products.find((entry) => entry.id === productId);
  const ctx = product
    ? buildReviewContext(product)
    : { item: "part", kind: "generic" as ProductKind };

  const used = new Set<string>();
  const comments: string[] = [];

  for (const rating of ratings) {
    const pool = shuffleWithRng(buildPool(ctx, rating), rng);
    const picked =
      pool.find((comment) => !used.has(comment)) ??
      `${pool[0] ?? "Good purchase."} (${comments.length + 1})`;
    used.add(picked);
    comments.push(picked);
  }

  return comments;
}
