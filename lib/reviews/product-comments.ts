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
  if (kind === "interior") return "interior piece";

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

/**
 * Reviews are assembled from opener + observation(s) + closer fragments
 * instead of picking one fixed sentence. Each fragment is a complete,
 * punctuated sentence, so any combination reads naturally. This gives a
 * (kind, rating) bucket thousands of effective combinations instead of
 * 3-4 fixed strings, so real variety survives at catalog scale instead
 * of collapsing into the same handful of lines everywhere.
 */

const OPENERS: Record<Rating, string[]> = {
  5: [
    "Okay, I'm impressed.",
    "This one's a keeper.",
    "Genuinely didn't expect to be this happy with it.",
    "Been putting off this review but it's earned.",
    "First thing I did was call my buddy and tell him about this.",
    "No complaints here, and I'm usually picky.",
    "This is going straight into the \"would recommend to anyone\" pile.",
    "Wasn't sure going in, but this settled it.",
    "Ordered late at night half-doubting myself — glad I pulled the trigger.",
    "Ten out of ten, would order again without thinking twice.",
  ],
  4: [
    "Pretty happy overall, just a couple small things.",
    "Solid buy, not flawless but close.",
    "Would order again, just going in with eyes open next time.",
    "Not going to overthink this one — it's good.",
    "Almost a perfect score from me.",
    "Did the job, and did it well.",
    "One or two nitpicks, otherwise no regrets.",
    "Good enough that I'm not shopping around anymore.",
  ],
  3: [
    "It's fine. Not amazing, not bad.",
    "Middle of the road, and that's okay.",
    "Does what it says on the tin.",
    "No strong feelings either way, honestly.",
    "Wouldn't rave about it, wouldn't warn anyone off it either.",
    "Gets the job done without any drama.",
  ],
  2: [
    "Kind of a mixed bag for me.",
    "Wanted to like this more than I did.",
    "It works, but it bugged me a little.",
    "Not what I pictured, but I made it work.",
    "A little underwhelmed if I'm being honest.",
  ],
  1: [
    "Rough start, but it came together.",
    "Almost sent this back, almost.",
    "Not going to lie, first impression wasn't great.",
    "Took some patience but I got there.",
  ],
};

const CLOSERS: Record<Rating, string[]> = {
  5: [
    "Already telling people in my group chat to buy from here.",
    "Shipping was quick too, which never hurts.",
    "This is exactly why I keep coming back to this site.",
    "Zero hesitation recommending it.",
    "Can't ask for more than that.",
    "That's a win in my book.",
    "Packaging was solid too — nothing rattling around.",
    "",
    "",
  ],
  4: [
    "Still calling it a win overall.",
    "Would tell a friend to go for it.",
    "Just wish the small stuff was tightened up.",
    "Not enough to knock it down a full star in my head.",
    "",
    "",
  ],
  3: [
    "Might look around a bit more next time, might not.",
    "Not mad about it, just neutral.",
    "Fine for what I needed it for.",
    "",
    "",
  ],
  2: [
    "Support did help sort it out, to be fair.",
    "Just wanted to leave an honest heads up for the next buyer.",
    "Not returning it, but wanted to flag it.",
    "",
  ],
  1: [
    "Customer service actually came through, so that softened it.",
    "Keeping it since it works now, but wanted to be upfront.",
    "",
  ],
};

const GENERIC_OBSERVATIONS: Record<Rating, string[]> = {
  5: [
    "The {item} showed up exactly like the photos, no funny business.",
    "Everything about the {item} checked out the moment I opened the box.",
    "Fit was spot on for the {item}, didn't have to force anything.",
    "The {item} felt more solid in hand than I expected from the pictures.",
    "Compared the {item} against my old part and it's a clear step up.",
    "Install went smoother than I planned thanks to how well the {item} was packed.",
    "Every bolt hole on the {item} lined up on the first try.",
    "The {item} has held up great since I put it on.",
  ],
  4: [
    "The {item} was close enough to the listing that I wasn't worried.",
    "One small mark on the {item} but nothing that affects how it works.",
    "Took a bit of extra time double-checking fitment on the {item}, worked out fine.",
    "The {item} does exactly what I needed, just not quite showroom perfect.",
    "Packaging on the {item} could've been tighter but nothing arrived damaged.",
    "The {item} performs well, I just noticed a couple cosmetic things up close.",
  ],
  3: [
    "The {item} works as advertised, nothing more, nothing less.",
    "Had to fiddle with the {item} a bit but got it dialed in.",
    "The {item} is fine for a budget-conscious build like mine.",
    "Wish the listing had one more angle of the {item}, but it's usable.",
    "The {item} isn't going to wow anyone, but it does the job.",
  ],
  2: [
    "There was a scuff on the {item} that didn't show up in any of the photos.",
    "Had to email support about a detail on the {item} that wasn't clear.",
    "The {item} needed a little extra work to seat properly.",
    "Finish on the {item} wasn't as clean as I pictured from the listing.",
  ],
  1: [
    "Had to go back and forth with support about the {item} before it was sorted.",
    "The {item} arrived with a cosmetic issue I wasn't expecting.",
    "Ended up needing an extra part locally to get the {item} fully installed.",
  ],
};

const KIND_OBSERVATIONS: Partial<Record<ProductKind, Record<Rating, string[]>>> = {
  engine: {
    5: [
      "Threw a compression tester on the {item} before we even touched the mounts, and every cylinder came back where it should.",
      "The {item} fired up on the first crank after the swap, which honestly caught me off guard.",
      "Shop guys were passing the {item} around the bay saying how clean it looked for the miles.",
      "No sludge, no weird smells, the {item} looked like it just came off the line.",
      "Timing marks on the {item} lined up exactly where the service manual said they should.",
      "The {item} has a couple hundred miles on it now and oil pressure's been rock solid.",
      "The {item} has been running great since I put it on.",
    ],
    4: [
      "Valve cover on the {item} had some light staining but that's normal for the miles.",
      "Double-checked the sensor harness on the {item} before final install, took maybe 20 extra minutes.",
      "The {item} runs strong, just a couple minor surface scratches on the block.",
      "Had to source one gasket locally for the {item}, everything else was there.",
    ],
    3: [
      "The {item} runs fine but I was hoping for slightly cleaner cosmetics for what I paid.",
      "Took some extra time tracing the wiring on the {item} before I was confident in it.",
    ],
    2: [
      "Found a bit of surface rust on the {item} tucked behind the intake, wasn't in the photos.",
      "The {item} needed a fresh set of gaskets before I trusted it, added an extra weekend.",
    ],
    1: [
      "Had to confirm a missing accessory bracket on the {item} with support before moving forward.",
    ],
  },
  turbo: {
    5: [
      "Spun the shaft on the {item} by hand before install, smooth as glass, no play at all.",
      "The {item} spooled up noticeably quicker than the unit it replaced.",
      "Flanges on the {item} were dead square, gaskets sealed on the very first try.",
      "Compressor wheel on the {item} looked untouched, not a single nick.",
      "Been driving on the {item} for a few weeks now, boost comes in exactly where I expected.",
    ],
    4: [
      "Tiny mark on the housing of the {item}, wheel still spun freely with zero drag.",
      "Double-checked the oil feed line thread size on the {item} before hooking it up, no issues.",
      "The {item} performs great, cosmetics just weren't quite showroom.",
    ],
    3: [
      "The {item} does its job but the exterior finish looked a little tired out of the box.",
    ],
    2: ["Small scuff on the {item} housing, wheel spin and boost were unaffected though."],
    1: ["Had one question about flange orientation on the {item}, support cleared it up fast."],
  },
  transmission: {
    5: [
      "Ran the {item} through every gear on the bench before it went in, felt tight with zero grinding.",
      "Case on the {item} was bone dry, not a hint of a leak anywhere.",
      "Bellhousing bolt pattern on the {item} matched our measurements to the millimeter.",
      "The {item} shifts cleaner than the one it replaced, night and day difference.",
    ],
    4: [
      "Pan on the {item} had some staining from use but the spin test felt great.",
      "Took a bit to track down the speed sensor location on the {item}, worked out in the end.",
    ],
    3: ["The {item} shifts fine, just rougher around the edges than the hero photo suggested."],
    2: ["One bolt hole on the {item} needed a light chase before everything seated right."],
    1: ["Needed a quick clarification on converter specs for the {item}, support handled it."],
  },
  brakes: {
    5: [
      "Rotors on the {item} bedded in clean, pedal feel improved the moment I drove it.",
      "Hardware kit that came with the {item} was complete down to the last clip.",
      "Calipers on the {item} bolted straight up, no spacers or workarounds needed.",
      "Stopping distance with the {item} is noticeably shorter than my old setup.",
    ],
    4: ["Rotors on the {item} had light storage haze but cleaned up with one wipe-down."],
    3: ["The {item} stops well, the caliper finish just wasn't as glossy as the photos."],
    2: ["Had to bend one pad clip on the {item} slightly before the pads seated right."],
    1: ["Asked which way the {item} pads were supposed to face, quick reply from support."],
  },
  exhaust: {
    5: [
      "Welds on the {item} were clean all the way around, no rough spots or blowholes.",
      "Gaskets sealed on the {item} first try, not a single tick after the heat cycle.",
      "The {item} sounds exactly how I hoped without being obnoxious at idle.",
    ],
    4: ["One flange face on the {item} had light discoloration but sealed up fine anyway."],
    3: ["The {item} fits and works, just expected a slightly brighter finish in person."],
    2: ["There was a scratch on the {item} that only one listing photo hinted at."],
    1: ["Wanted to confirm inlet diameter on the {item} before welding, got a fast answer."],
  },
  "body-bed": {
    5: [
      "Bed floor on the {item} was dead straight, not a single wave or dent.",
      "Tailgate gap lined up perfectly once we mocked the {item} up on the frame.",
      "Rails on the {item} were cleaner in person than the listing photos even showed.",
    ],
    4: ["Small paint fade on one rail of the {item} but the structure underneath is solid."],
    3: ["The {item} is usable, just had a couple scuffs the listing angles didn't catch."],
    2: ["One corner of the {item} had more wear than the close-up photo let on."],
    1: ["Asked about the bolt pattern on the {item} before freight pickup, got a clear answer."],
  },
  "body-shell": {
    5: [
      "Latches and glass on the {item} both worked perfectly right out of the gate.",
      "Couldn't find a single crack in the fiberglass on the {item}, even checked with a flashlight.",
      "The {item} lined up on the bed rails like it was made for this exact truck.",
    ],
    4: ["Rear window on the {item} had light haze but still opens and seals fine."],
    3: ["The {item} fits well, the headliner just needs a clean but structure is solid."],
    2: ["Small chip in the gel coat on the {item} wasn't visible in every photo."],
    1: ["Confirmed the clamp kit would fit the {item} before install, support was quick about it."],
  },
  lighting: {
    5: [
      "Every LED on the {item} lit up the second I plugged it in, lens was crystal clear.",
      "Blind-spot function on the {item} worked correctly on the very first test.",
      "Wiring harness on the {item} plugged straight into factory connectors, no splicing.",
    ],
    4: ["Housing on the {item} had light scuffing but the bulbs and connectors were flawless."],
    3: ["The {item} works fine, lens clarity is just a touch below the hero photo."],
    2: ["Had to trim one mounting tab on the {item} slightly, works great now though."],
    1: ["Asked which connector the {item} used before install, got the right answer quickly."],
  },
  interior: {
    5: [
      "Stitching on the {item} matched the factory look better than I expected for the price.",
      "The {item} dropped right into the factory mounting points, no trimming needed.",
      "Material on the {item} feels genuinely durable, not the cheap stuff I was bracing for.",
    ],
    4: ["Color on the {item} was a hair off from the photos but close enough not to matter."],
    3: ["The {item} fits fine, just doesn't feel quite as premium as the listing implied."],
    2: ["One mounting clip on the {item} was a little loose out of the box, tightened easily."],
    1: ["Had a question about which trim year the {item} matched, support answered same day."],
  },
};

function buildFragmentPool(
  pools: Partial<Record<ProductKind, Record<Rating, string[]>>>,
  kind: ProductKind,
  rating: Rating
): string[] {
  return pools[kind]?.[rating] ?? [];
}

function pick<T>(items: T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(rng() * items.length)];
}

function pickDistinct<T>(items: T[], count: number, rng: () => number): T[] {
  if (items.length === 0) return [];
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0] as T);
  }
  return out;
}

function composeReview(ctx: ReviewContext, rating: Rating, rng: () => number): string {
  const kindObservations = buildFragmentPool(KIND_OBSERVATIONS, ctx.kind, rating);
  const observationPool = [...kindObservations, ...GENERIC_OBSERVATIONS[rating]];

  const opener = pick(OPENERS[rating], rng);
  const closer = pick(CLOSERS[rating], rng);
  const observationCount = rng() < 0.35 && observationPool.length > 1 ? 2 : 1;
  const observations = pickDistinct(observationPool, observationCount, rng);

  const includeOpener = rng() < 0.8;
  const includeCloser = rng() < 0.45;

  const parts: string[] = [];
  if (includeOpener && opener) parts.push(opener);
  for (const line of observations) parts.push(fill(line, ctx));
  if (includeCloser && closer) parts.push(closer);

  // Guarantee at least one real sentence even if openers/closers got skipped.
  if (parts.filter(Boolean).length === 0) {
    parts.push(fill(observationPool[0] ?? "Good purchase.", ctx));
  }

  return parts.filter(Boolean).join(" ");
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
    let comment = composeReview(ctx, rating, rng);
    let attempts = 0;
    while (used.has(comment) && attempts < 6) {
      comment = composeReview(ctx, rating, rng);
      attempts += 1;
    }
    used.add(comment);
    comments.push(comment);
  }

  return comments;
}
