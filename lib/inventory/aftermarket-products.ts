/* =========================================================
   AFTERMARKET INVENTORY
   ---------------------------------------------------------
   Used / refurbished marketplace listings. Set `price` to the competitor /
   market reference price; applyPublicPrices() stores it on compareAtPrice
   (struck through) and sets price to our discounted list price.
========================================================= */

import type { Product } from "./types";

function media(slug: string, files: string[]) {
  const paths = files.map(
    (file) => `/product-media/aftermarket/${slug}/${file}`
  );
  return { thumbnail: paths[0], images: paths };
}

function aftermarketDescription(
  name: string,
  details: string,
  fitment?: string
): string {
  const fitmentLine = fitment
    ? `\nFitment: ${fitment}`
    : "\nFitment: Confirm vehicle application at checkout.";

  return `${name}

${details}${fitmentLine}

Condition notes: Inspected and photographed as the actual unit available.

Shipping
Worldwide shipping available — contact for a freight quote when needed.`;
}

function canopyDescription(
  name: string,
  details: string,
  fitment?: string
): string {
  const fitmentLine = fitment
    ? `\nFitment: ${fitment}`
    : "\nFitment: Confirm bed length and cab style at checkout.";

  return `${name}

${details}${fitmentLine}

Condition notes: Inspected for structural integrity, latch function, and weather sealing. Photos show actual unit available.

Shipping
Freight / local pickup options available — contact for a quote on oversized canopy freight.`;
}

export const aftermarketProducts: Product[] = [
  {
    id: 173,
    name: "1500 mm Aluminum Canopy",
    category: "aftermarket",
    brand: "universal",
    price: 1899,
    stock: true,
    stockQty: 2,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "Utility / Ute beds ~1500 mm internal width",
    createdAt: 1740441600000,
    ...media("1500-mm-aluminum-canopy", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
    ]),
    description: canopyDescription(
      "1500 mm Aluminum Canopy",
      "Lightweight aluminum utility canopy with side access and lock-ready rear gate. Ideal for work trucks and overland ute setups needing weather protection without excessive weight."
    ),
  },
  {
    id: 174,
    name: "Alloy Ute Canopy",
    category: "aftermarket",
    brand: "universal",
    price: 2199,
    stock: true,
    stockQty: 1,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "Mid-size utility / ute platforms",
    createdAt: 1740528000000,
    ...media("alloy-ute-canopy", ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]),
    description: canopyDescription(
      "Alloy Ute Canopy",
      "Alloy ute canopy with clean body lines, reinforced frame, and secure rear closure. Strong daily-driver and tradesman option with premium alloy construction."
    ),
  },
  {
    id: 175,
    name: "Aluminum Canopy",
    category: "aftermarket",
    brand: "universal",
    price: 1799,
    stock: true,
    stockQty: 3,
    condition: "Used",
    location: "USA Warehouse",
    createdAt: 1740614400000,
    ...media("aluminum-canopy", ["1.jpg", "2.jpg", "3.jpg"]),
    description: canopyDescription(
      "Aluminum Canopy",
      "General-fit aluminum truck canopy with durable panels and weather-resistant seals. Versatile bed cap for cargo security and all-weather hauling."
    ),
  },
  {
    id: 176,
    name: "Camper Shell Snugtop",
    category: "aftermarket",
    brand: "snugtop",
    price: 2499,
    stock: true,
    stockQty: 1,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "Full-size truck camper shell applications",
    createdAt: 1740700800000,
    ...media("camper-shell-snugtop", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
      "7.jpg",
      "8.jpg",
      "9.jpg",
      "10.jpg",
      "11.jpg",
      "12.jpg",
      "13.jpg",
      "14.jpg",
    ]),
    description: canopyDescription(
      "Camper Shell Snugtop",
      "Snugtop camper shell with integrated side windows, rear gate, and factory-style fitment. Popular choice for secure bed storage and weekend adventure builds.",
      "Full-size truck camper shell applications"
    ),
  },
  {
    id: 177,
    name: "Canopy",
    category: "aftermarket",
    brand: "universal",
    price: 1599,
    stock: true,
    stockQty: 2,
    condition: "Used",
    location: "USA Warehouse",
    createdAt: 1740787200000,
    ...media("truck-bed-canopy", ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]),
    description: canopyDescription(
      "Canopy",
      "General-purpose truck bed canopy with solid rear closure and side profile compatible with many utility beds. Practical used cap for work or recreation."
    ),
  },
  {
    id: 178,
    name: "EOI 1200 Black Canopy",
    category: "aftermarket",
    brand: "universal",
    price: 1999,
    stock: true,
    stockQty: 1,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "~1200 mm bed width utility platforms",
    createdAt: 1740873600000,
    ...media("eoi-1200-black-canopy", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
    ]),
    description: canopyDescription(
      "EOI 1200 Black Canopy",
      "EOI black canopy sized for ~1200 mm applications with clean finish and secure latching. Compact footprint for smaller utility beds.",
      "~1200 mm bed width utility platforms"
    ),
  },
  {
    id: 179,
    name: "Leer 100XR",
    category: "aftermarket",
    brand: "leer",
    price: 2299,
    stock: true,
    stockQty: 2,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "Full-size truck Leer 100XR applications",
    createdAt: 1740960000000,
    ...media("leer-100xr", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
      "7.jpg",
      "8.jpg",
    ]),
    description: canopyDescription(
      "Leer 100XR",
      "Leer 100XR mid-rise truck cap with extended side glass and OEM-style integration. Strong choice for daily drivers needing bed security with improved visibility.",
      "Full-size truck Leer 100XR applications"
    ),
  },
  {
    id: 180,
    name: "Leer Camper Shell",
    category: "aftermarket",
    brand: "leer",
    price: 2099,
    stock: true,
    stockQty: 1,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "Full-size truck Leer camper shell applications",
    createdAt: 1741046400000,
    ...media("leer-camper-shell", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg",
      "6.jpg",
      "7.jpg",
    ]),
    description: canopyDescription(
      "Leer Camper Shell",
      "Leer camper shell with rear gate, side glass, and factory-style mounting hardware. Ready for secure storage or overland build-out.",
      "Full-size truck Leer camper shell applications"
    ),
  },
  {
    id: 181,
    name: "Metal Camper Shell Topper Canopy Bed Cap For F150 5.5 Ft 2015 to 2020",
    category: "aftermarket",
    brand: "ford",
    price: 2699,
    stock: true,
    stockQty: 1,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "2015–2020 Ford F-150 5.5 ft bed",
    createdAt: 1741132800000,
    ...media("f150-5-5ft-camper-shell-canopy", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
    ]),
    description: canopyDescription(
      "Metal Camper Shell Topper Canopy Bed Cap For F150 5.5 Ft 2015 to 2020",
      "Metal camper shell bed cap built for 2015–2020 Ford F-150 short beds. Durable steel/composite construction with integrated rear gate and side profile matched to the S550-era F-150 body lines.",
      "2015–2020 Ford F-150 5.5 ft bed"
    ),
  },
  {
    id: 182,
    name: "Ute Canopy",
    category: "aftermarket",
    brand: "universal",
    price: 1899,
    stock: true,
    stockQty: 2,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "Utility / ute bed platforms",
    createdAt: 1741219200000,
    ...media("ute-canopy", ["1.jpg", "2.jpg", "3.jpg", "4.jpg"]),
    description: canopyDescription(
      "Ute Canopy",
      "Utility ute canopy with reinforced structure and weather sealing. Practical used cap for trades, camping gear storage, and daily bed protection.",
      "Utility / ute bed platforms"
    ),
  },
  {
    id: 183,
    name: "White Leer Cab High 100XR Shell",
    category: "aftermarket",
    brand: "leer",
    price: 2399,
    stock: true,
    stockQty: 1,
    condition: "Used",
    location: "USA Warehouse",
    fitment: "Full-size truck Leer cab-high 100XR applications",
    createdAt: 1741305600000,
    ...media("white-leer-100xr-high-cab-shell", [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
    ]),
    description: canopyDescription(
      "White Leer Cab High 100XR Shell",
      "White Leer cab-high 100XR shell with maximum interior headroom and clean OEM-style lines. Ideal for crews needing full bed coverage with cab-height clearance.",
      "Full-size truck Leer cab-high 100XR applications"
    ),
  },
  {
    id: 184,
    name: "ARB Classic Plus Canopy for 2016 Toyota Hilux Dual Cab",
    category: "aftermarket",
    brand: "arb",
    price: 1266,
    stock: true,
    stockQty: 1,
    condition: "Used like new",
    location: "USA Warehouse",
    fitment: "2016 Toyota Hilux Dual Cab",
    createdAt: 1741392000000,
    ...media("ARB classic plus Canopy for 2016 Toyota Hilux Dual Cab", [
      "731219723_879206501350550_5360347662989400137_n.jpg",
      "731323109_2107315573329176_887557035069605609_n.jpg",
      "731356599_1709730683684159_6971363893216190288_n.jpg",
      "731396496_3204304313092632_4406847845565885735_n.jpg",
      "731397579_1731405738306549_3594661867142818180_n.jpg",
      "733746713_1745188889808921_1297048353704708332_n.jpg",
    ]),
    description: canopyDescription(
      "ARB Classic Plus Canopy for 2016 Toyota Hilux Dual Cab",
      "ARB Classic Plus canopy engineered for the 2016 Toyota Hilux Dual Cab. Features integrated roof rails, rear gate with secure latching, side glass, and ARB's reinforced composite construction for daily work use and overland storage.",
      "2016 Toyota Hilux Dual Cab"
    ),
  },
  {
    id: 185,
    name: "Bilstein Suspension",
    category: "aftermarket",
    brand: "bilstein",
    price: 1266,
    stock: true,
    stockQty: 1,
    condition: "Used like new",
    location: "USA Warehouse",
    fitment: "Ford Everest Tremor",
    createdAt: 1741478400000,
    ...media("bilstein-suspension", [
      "IMG_4137.jpeg",
      "IMG_4138.jpeg",
      "IMG_4139.jpeg",
      "IMG_4140.jpeg",
    ]),
    description: aftermarketDescription(
      "Bilstein Suspension",
      "Near-new Bilstein suspension take-off from a Ford Everest Tremor — only 6 km traveled. 26.5 specification as listed. Complete used set in excellent condition for Tremor/Everest applications.",
      "Ford Everest Tremor"
    ),
  },
];
