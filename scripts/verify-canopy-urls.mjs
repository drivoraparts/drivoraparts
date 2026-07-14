/**
 * Verify remote canopy photo URLs respond with image bytes.
 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36";

const urls = [
  ["arb-ascent", "https://delivery-p144166-e1487989.adobeaemcloud.com/adobe/assets/urn:aaid:aem:37c3b9ca-1df6-4685-825f-66424dbf59e7/as/image.jpg?width=1200&quality=90"],
  ["arb-classic", "https://delivery-p144166-e1487989.adobeaemcloud.com/adobe/assets/urn:aaid:aem:2e8e360a-7271-4b7f-886d-787106ca15ec/as/image.jpg?width=1200&quality=90"],
  ["arb-cls-dam", "https://www.arb.com.au/content/dam/arb/production/products/ute-canopies---lids/canopies/classic-canopy/CLS76B_v2.jpg"],
  ["arb-pinnacle-aem", "https://delivery-p144166-e1487989.adobeaemcloud.com/adobe/assets/urn:aaid:aem:fab04855-4791-4518-99a9-2e7eb2b48cb3/as/image.jpg?width=1200&quality=90"],
  ["rsi-adventure", "https://cdn.campway.com/wp-content/uploads/Ford-Ranger-SmartCap-EVOa-Edition_b90301a15d-1-1024x573.jpg"],
  ["rsi-sport", "https://cdn.campway.com/wp-content/uploads/Dodge-RAM-SmartCap-Edition_b90301a15d-1-jpg.webp"],
  ["rsi-commercial", "https://cdn.campway.com/wp-content/uploads/Silverado-1500-SmartCap-EVOc_b90301a15d-730x450-1-jpeg.webp"],
  ["rsi-defender", "https://cdn.campway.com/wp-content/uploads/SmartCap-EVOa-Ranger-1600x876.webp"],
  ["alu-explorer", "https://acmedia.s3.amazonaws.com/wp-content/uploads/2024/11/19181429/DC_EXPLORER_CANOPY-7-scaled.jpg"],
  ["alu-camper", "https://acmedia.s3.amazonaws.com/wp-content/uploads/2024/11/14140735/Alu-Cab-Canopy-Tent.jpg"],
  ["are-cx", "https://realtruck.com/production/a-r-e-cx-classic-series-truck-cap/r/800x600/fff/80/05cfa30e4abaf308227199347e0b4d33.jpg"],
  ["are-mx", "https://realtruck.com/production/are-mx-series-truck-cap-main/r/800x600/fff/80/a082a2f5f11f79cdc31719201d089210.jpg"],
  ["are-z2", "https://realtruck.com/production/a-r-e-z2-series-truck-cap-main/r/800x600/fff/80/8c0e8e8e8e8e8e8e8e8e8e8e8e8e8e8e.jpg"],
  ["are-overland", "https://realtruck.com/production/a-r-e-overland-series-truck-cap/r/800x600/fff/80/7dbc5019d5e4f23105d4bf52ee8f87df.jpg"],
  ["are-v", "https://realtruck.com/production/are-v-series-truck-cap-main/r/800x600/fff/80/2d26873e5e6ffe52774a77b1489a7719.jpg"],
  ["leer-100xr", "https://cdn11.bigcommerce.com/s-h73wg4qqbw/images/stencil/1280x1280/products/456/1691/100xr_2017_chevy_silverado-%25283%2529__13380.1646854283.jpg?c=1"],
  ["boss-s17", "https://www.bossaluminium.com.au/wp-content/uploads/2025/09/S17-Hero-31-scaled.jpg"],
  ["boss-twin79", "https://www.bossaluminium.com.au/wp-content/uploads/2024/11/twin-79-featured-image.jpg"],
  ["norweld-deluxe", "https://norweld.com.au/wp-content/uploads/DeluxeCanopyHero-CanopyOnly-1920x1080-1.webp"],
  ["norweld-lc200", "https://norweld.com.au/wp-content/uploads/Toyota-LandCruiser-200-Graphite-Elite-Tray-with-Canopy-Rear-Trundle-Drawer.webp"],
  ["mrt-canopy", "https://www.mrt.com.au/staging/wp-content/uploads/2022/09/aluminium-ute-canopies-2021-scaled-1-scaled.jpg"],
  ["tcusa", "https://truckcoversusa.com/wp-content/uploads/2023/10/2023-Ford-Raptor-R-v5.png"],
  ["aero-premium", "https://www.aeroklas.com.au/media/catalog/product/cache/1ac22f2a1b37e98f7736dbefe464d7fd/c/a/canalumoddmax24-01-667.webp"],
  ["aero-stylish", "https://www.aeroklas.com.au/media/catalog/product/cache/1ac22f2a1b37e98f7736dbefe464d7fd/3/0/304121300205f-727.webp"],
  ["aero-commercial", "https://www.aeroklas.com.au/media/catalog/product/cache/1ac22f2a1b37e98f7736dbefe464d7fd/3/0/304138300353p-766.webp"],
  ["aero-ford", "https://www.aeroklas.com.au/media/catalog/product/cache/1ac22f2a1b37e98f7736dbefe464d7fd/c/a/canfsphil16fw-01-899.webp"],
  ["aero-triton", "https://www.aeroklas.com.au/media/catalog/product/cache/1ac22f2a1b37e98f7736dbefe464d7fd/c/a/canfestri24yo-01-796.webp"],
  ["aero-dmax", "https://www.aeroklas.com.au/media/catalog/product/cache/1ac22f2a1b37e98f7736dbefe464d7fd/b/c/bctd70w-01-163.webp"],
];

for (const [name, url] of urls) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": UA } });
    const buf = Buffer.from(await r.arrayBuffer());
    console.log(name, r.status, buf.length, r.headers.get("content-type")?.slice(0, 30));
  } catch (e) {
    console.log(name, "ERR", e.message);
  }
}
