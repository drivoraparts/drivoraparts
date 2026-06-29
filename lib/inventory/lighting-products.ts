import type { Product } from "./types";

function media(slug: string, files: string[]) {
  return { thumbnail: files[0], images: files };
}

export const lightingProducts: Product[] = [
  {
    id: 135,
    name: "AlphaRex NOVA LED Headlights",
    category: "lighting",
    brand: "alpharex",
    price: 1299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("alpharex-nova-led-headlights", [
      "/product-media/lights/alpharex-nova-led-headlights/1.jpg",
      "/product-media/lights/alpharex-nova-led-headlights/2.jpg",
      "/product-media/lights/alpharex-nova-led-headlights/3.jpg",
    ]),
    description: `AlphaRex NOVA LED Headlights

AlphaRex NOVA LED headlight assemblies with sequential DRL, turn signals, and a modern OEM+ appearance.

The AlphaRex NOVA LED Headlights upgrade factory units with bright LED projectors, animated startup sequences, and a clean contemporary design. Built for enthusiasts who want improved nighttime visibility and a standout front-end look without sacrificing daily drivability.

Specifications
• Part Type: Complete LED Headlight Assembly
• Lighting: LED Projector Low/High Beam + DRL
• Features: Sequential Turn Signals & Startup Animation
• Lens: Polycarbonate / UV-Resistant Housing
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: AlphaRex

Highlights
• Full LED Headlight Upgrade
• Sequential DRL & Turn Signals
• Modern OEM+ Styling
• Improved Nighttime Visibility
• Show-Ready Front-End Look

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 136,
    name: "Baja Designs OnX6 LED Light Bar",
    category: "lighting",
    brand: "baja-designs",
    price: 1099,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("baja-designs-onx6-led-light-bar", [
      "/product-media/lights/baja-designs-onx6-led-light-bar/1.jpg",
      "/product-media/lights/baja-designs-onx6-led-light-bar/2.jpg",
      "/product-media/lights/baja-designs-onx6-led-light-bar/3.jpg",
      "/product-media/lights/baja-designs-onx6-led-light-bar/4.jpg",
      "/product-media/lights/baja-designs-onx6-led-light-bar/5.jpg",
      "/product-media/lights/baja-designs-onx6-led-light-bar/6.jpg",
      "/product-media/lights/baja-designs-onx6-led-light-bar/7.jpg",
      "/product-media/lights/baja-designs-onx6-led-light-bar/8.jpg",
    ]),
    description: `Baja Designs OnX6 LED Light Bar

Baja Designs OnX6 LED light bar delivering high-output forward lighting for off-road, overlanding, and trail use.

The Baja Designs OnX6 LED Light Bar combines premium LED optics with a rugged housing built for harsh environments. Ideal for trucks, Jeeps, and UTVs, it provides powerful long-range illumination with Baja Designs' race-proven reliability and clean beam patterns.

Specifications
• Part Type: LED Light Bar (OnX6 Series)
• Output: High-Intensity Forward Lighting
• Housing: Rugged Off-Road Construction
• Beam Pattern: Application-Specific Optics
• Fitment: Universal Mounting (Confirm Bracket at Checkout)
• Manufacturer: Baja Designs

Highlights
• Race-Proven Baja Designs Optics
• High-Output Off-Road Illumination
• Rugged All-Terrain Housing
• Long-Range Forward Lighting
• Ideal for Trucks & Overlanding

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 137,
    name: "Baja Designs Squadron Pro",
    category: "lighting",
    brand: "baja-designs",
    price: 449,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("baja-designs-squadron-pro", [
      "/product-media/lights/baja-designs-squadron-pro/1.jpg",
      "/product-media/lights/baja-designs-squadron-pro/2.jpg",
      "/product-media/lights/baja-designs-squadron-pro/3.jpg",
      "/product-media/lights/baja-designs-squadron-pro/4.jpg",
      "/product-media/lights/baja-designs-squadron-pro/5.jpg",
      "/product-media/lights/baja-designs-squadron-pro/6.jpg",
      "/product-media/lights/baja-designs-squadron-pro/7.jpg",
      "/product-media/lights/baja-designs-squadron-pro/8.jpg",
      "/product-media/lights/baja-designs-squadron-pro/9.jpg",
      "/product-media/lights/baja-designs-squadron-pro/10.jpg",
      "/product-media/lights/baja-designs-squadron-pro/11.jpg",
      "/product-media/lights/baja-designs-squadron-pro/12.jpg",
    ]),
    description: `Baja Designs Squadron Pro

Compact Baja Designs Squadron Pro LED pod for auxiliary fog, driving, or spot lighting on any build.

The Baja Designs Squadron Pro packs serious output into a small footprint, making it perfect for A-pillar pods, bumpers, and roof mounts. With premium optics and durable construction, it is a versatile auxiliary light trusted on trails, desert runs, and daily-driven adventure rigs.

Specifications
• Part Type: LED Auxiliary Light Pod (Squadron Pro)
• Output: High-Intensity Spot / Driving / Fog Patterns
• Housing: Compact Rugged Enclosure
• Mounting: Universal Pod Bracket Compatible
• Fitment: Universal (Confirm Mount at Checkout)
• Manufacturer: Baja Designs

Highlights
• Compact High-Output LED Pod
• Versatile Auxiliary Lighting
• Rugged Off-Road Construction
• Ideal for Bumpers & A-Pillars
• Baja Designs Race Heritage

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 138,
    name: "Diode Dynamics SS3 Fog Lights",
    category: "lighting",
    brand: "diode-dynamics",
    price: 349,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("diode-dynamics-ss3-fog-lights", [
      "/product-media/lights/diode-dynamics-ss3-fog-lights/1.jpg",
      "/product-media/lights/diode-dynamics-ss3-fog-lights/2.jpg",
      "/product-media/lights/diode-dynamics-ss3-fog-lights/3.jpg",
      "/product-media/lights/diode-dynamics-ss3-fog-lights/4.jpg",
    ]),
    description: `Diode Dynamics SS3 Fog Lights

Diode Dynamics SS3 LED fog light kit with SAE-compliant output and crisp cutoff for all-weather visibility.

The Diode Dynamics SS3 Fog Lights deliver a wide, controlled beam pattern that cuts through rain, fog, and snow without glare. With modern LED efficiency and application-specific brackets on select kits, they are a top upgrade for street and light off-road use.

Specifications
• Part Type: LED Fog Light Kit (SS3)
• Beam: SAE-Compliant Fog Pattern
• Output: High-Efficiency LED Modules
• Housing: Weather-Sealed Enclosure
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Diode Dynamics

Highlights
• SAE-Compliant Fog Beam Pattern
• All-Weather Visibility Upgrade
• Efficient Modern LED Output
• Clean Cutoff, Reduced Glare
• Trusted Diode Dynamics Quality

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 139,
    name: "Govee RGB Interior Lights",
    category: "lighting",
    brand: "govee",
    price: 189,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("govee-rgb-interior-lights", [
      "/product-media/lights/govee-rgb-interior-lights/1.jpg",
      "/product-media/lights/govee-rgb-interior-lights/2.jpg",
      "/product-media/lights/govee-rgb-interior-lights/3.jpg",
      "/product-media/lights/govee-rgb-interior-lights/4.jpg",
    ]),
    description: `Govee RGB Interior Lights

Govee RGB interior ambient lighting kit with app control, music sync, and easy installation for custom cabin ambiance.

The Govee RGB Interior Lights transform your cabin with millions of colors, preset scenes, and smartphone control. Ideal for show builds and daily drivers alike, the flexible LED strips install cleanly along dash, footwell, and door trim for a premium ambient effect.

Specifications
• Part Type: RGB Interior Ambient Light Kit
• Control: App / Remote with Preset Scenes
• Features: Music Sync & Color Customization
• Installation: Adhesive LED Strips + Controller
• Fitment: Universal Interior Application
• Manufacturer: Govee

Highlights
• App-Controlled RGB Ambient Lighting
• Music Sync & Custom Color Scenes
• Easy Interior Installation
• Show-Ready Cabin Ambiance
• Affordable Interior Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 140,
    name: "LED Side Marker Lights",
    category: "lighting",
    brand: "universal",
    price: 129,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("led-side-marker-lights", [
      "/product-media/lights/led-side-marker-lights/1.jpg",
      "/product-media/lights/led-side-marker-lights/2.jpg",
      "/product-media/lights/led-side-marker-lights/3.jpg",
      "/product-media/lights/led-side-marker-lights/4.jpg",
    ]),
    description: `LED Side Marker Lights

LED side marker light upgrade for brighter, cleaner side visibility and a modern exterior appearance.

The LED Side Marker Lights replace dim factory markers with bright, efficient LEDs in a clean housing design. A simple exterior refresh that improves visibility and complements lowered, aftermarket, and show builds.

Specifications
• Part Type: LED Side Marker Light Set
• Output: Bright LED Illumination
• Housing: Smoked or Clear Options (Confirm at Checkout)
• Installation: Plug-and-Play on Supported Applications
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Universal

Highlights
• Brighter Side Visibility
• Modern LED Appearance
• Simple Exterior Refresh
• Complements Aftermarket Builds
• Efficient Long-Life LEDs

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 141,
    name: "Morimoto XB LED Headlights",
    category: "lighting",
    brand: "morimoto",
    price: 1199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("morimoto-xb-led-headlights", [
      "/product-media/lights/morimoto-xb-led-headlights/1.jpg",
      "/product-media/lights/morimoto-xb-led-headlights/2.jpg",
      "/product-media/lights/morimoto-xb-led-headlights/3.jpg",
      "/product-media/lights/morimoto-xb-led-headlights/4.jpg",
      "/product-media/lights/morimoto-xb-led-headlights/5.jpg",
      "/product-media/lights/morimoto-xb-led-headlights/6.jpg",
      "/product-media/lights/morimoto-xb-led-headlights/7.jpg",
    ]),
    description: `Morimoto XB LED Headlights

Morimoto XB LED headlight assemblies with superior beam output, reliability, and a refined OEM+ finish.

The Morimoto XB LED Headlights are among the most trusted aftermarket headlight upgrades, combining sharp cutoff patterns, strong output, and durable housings. Perfect for enthusiasts who want a significant lighting improvement with a factory-quality appearance.

Specifications
• Part Type: Complete LED Headlight Assembly (XB Series)
• Lighting: LED Projector Low/High Beam
• Optics: Morimoto XB Projector Technology
• Housing: UV-Resistant Sealed Enclosure
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Morimoto

Highlights
• Industry-Leading Morimoto XB Output
• Sharp Beam Cutoff & Visibility
• OEM+ Fit and Finish
• Durable Sealed Housing
• Top-Tier Headlight Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 142,
    name: "Morimoto XB LED Tail Lights",
    category: "lighting",
    brand: "morimoto",
    price: 699,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("morimoto-xb-led-tail-lights", [
      "/product-media/lights/morimoto-xb-led-tail-lights/1.jpg",
      "/product-media/lights/morimoto-xb-led-tail-lights/2.jpg",
      "/product-media/lights/morimoto-xb-led-tail-lights/3.jpg",
      "/product-media/lights/morimoto-xb-led-tail-lights/4.jpg",
    ]),
    description: `Morimoto XB LED Tail Lights

Morimoto XB LED tail light assemblies with bright reverse/brake illumination and a clean modern rear-end look.

The Morimoto XB LED Tail Lights upgrade the rear of your vehicle with crisp LED lighting, improved visibility, and a refined appearance. Built to Morimoto's quality standards, they deliver a noticeable rear-end transformation for street and show builds.

Specifications
• Part Type: Complete LED Tail Light Assembly (XB Series)
• Lighting: LED Brake, Turn, Reverse Functions
• Housing: Sealed UV-Resistant Enclosure
• Features: Bright LED Output & Modern Styling
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Morimoto

Highlights
• Bright Morimoto XB LED Output
• Modern Rear-End Appearance
• Improved Brake & Reverse Visibility
• Sealed Durable Housing
• Pairs with XB Headlight Upgrades

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 143,
    name: "OPT7 Aura Underglow Kit",
    category: "lighting",
    brand: "opt7",
    price: 279,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("opt7-aura-underglow-kit", [
      "/product-media/lights/opt7-aura-underglow-kit/1.jpg",
      "/product-media/lights/opt7-aura-underglow-kit/2.jpg",
      "/product-media/lights/opt7-aura-underglow-kit/3.jpg",
      "/product-media/lights/opt7-aura-underglow-kit/4.jpg",
      "/product-media/lights/opt7-aura-underglow-kit/5.jpg",
      "/product-media/lights/opt7-aura-underglow-kit/6.jpg",
    ]),
    description: `OPT7 Aura Underglow Kit

OPT7 Aura underglow kit with app-controlled RGB lighting, weather-resistant strips, and show-ready underbody effects.

The OPT7 Aura Underglow Kit adds vivid underbody lighting with smartphone control, preset animations, and durable weather-resistant LED strips. A popular choice for show cars and enthusiasts who want a standout nighttime presence.

Specifications
• Part Type: RGB Underglow Light Kit (Aura)
• Control: App with Presets & Custom Colors
• Installation: Underbody Adhesive LED Strips
• Weather Rating: Weather-Resistant Construction
• Fitment: Universal Underbody Application
• Manufacturer: OPT7

Highlights
• App-Controlled Underbody RGB Lighting
• Show-Ready Preset Animations
• Weather-Resistant LED Strips
• Standout Nighttime Presence
• Popular Show Car Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 144,
    name: "Oracle Halo Headlights",
    category: "lighting",
    brand: "oracle",
    price: 899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("oracle-halo-headlights", [
      "/product-media/lights/oracle-halo-headlights/1.jpg",
      "/product-media/lights/oracle-halo-headlights/2.jpg",
      "/product-media/lights/oracle-halo-headlights/3.jpg",
    ]),
    description: `Oracle Halo Headlights

Oracle halo headlight upgrade with vivid LED rings and a distinctive custom front-end appearance.

The Oracle Halo Headlights feature bright LED halo rings that give your vehicle a unique, high-end look day or night. A favorite for show builds and custom front-end styling, Oracle halos deliver head-turning presence with reliable LED performance.

Specifications
• Part Type: Halo Headlight Upgrade / Assembly
• Lighting: LED Halo Rings + Factory Beam Functions
• Features: Multi-Color or White Halos (Confirm at Checkout)
• Housing: Application-Specific Headlight Unit
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Oracle Lighting

Highlights
• Signature Oracle Halo Look
• Bright LED Ring Illumination
• Custom Show-Build Front End
• Day & Night Visual Impact
• Trusted Oracle Lighting Brand

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 145,
    name: "Osram Night Breaker Laser",
    category: "lighting",
    brand: "osram",
    price: 119,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("osram-night-breaker-laser", [
      "/product-media/lights/osram-night-breaker-laser/1.jpg",
      "/product-media/lights/osram-night-breaker-laser/2.jpg",
      "/product-media/lights/osram-night-breaker-laser/3.jpg",
      "/product-media/lights/osram-night-breaker-laser/4.jpg",
      "/product-media/lights/osram-night-breaker-laser/5.jpg",
    ]),
    description: `Osram Night Breaker Laser

Osram Night Breaker Laser halogen bulbs delivering up to 150% more brightness for improved nighttime driving.

The Osram Night Breaker Laser bulbs offer a simple drop-in upgrade for factory headlight housings, with a whiter, brighter beam and Osram's proven OEM-quality construction. Ideal for drivers who want better visibility without converting to full LED assemblies.

Specifications
• Part Type: Performance Halogen Bulb Set
• Brightness: Up to 150% More Light vs Standard
• Color Temp: Whiter Light Output
• Fitment: Standard Halogen Socket Sizes (Confirm at Checkout)
• Application: Low / High Beam (Application-Specific)
• Manufacturer: Osram

Highlights
• Simple Drop-In Brightness Upgrade
• Up to 150% More Light
• Whiter Beam for Better Visibility
• Osram OEM-Quality Construction
• Affordable Lighting Improvement

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 146,
    name: "Philips Ultinon Pro9000",
    category: "lighting",
    brand: "philips",
    price: 149,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("philips-ultinon-pro9000", [
      "/product-media/lights/philips-ultinon-pro9000/1.jpg",
      "/product-media/lights/philips-ultinon-pro9000/2.jpg",
      "/product-media/lights/philips-ultinon-pro9000/3.jpg",
      "/product-media/lights/philips-ultinon-pro9000/4.jpg",
    ]),
    description: `Philips Ultinon Pro9000

Philips Ultinon Pro9000 LED bulbs offering bright, road-legal LED performance in compatible factory housings.

The Philips Ultinon Pro9000 LED bulbs deliver crisp white light and strong output for supported halogen-reflector and projector applications. A premium bulb upgrade from one of the world's leading automotive lighting brands.

Specifications
• Part Type: LED Replacement Bulb Set (Ultinon Pro9000)
• Output: Bright White LED Light
• Compatibility: Specific Halogen Housing Types (Confirm at Checkout)
• Fitment: Standard Bulb Socket Sizes
• Application: Low / High Beam (Application-Specific)
• Manufacturer: Philips

Highlights
• Premium Philips LED Bulb Upgrade
• Crisp White Light Output
• Road-Legal on Supported Applications
• Drop-In Replacement Convenience
• Trusted Global Lighting Brand

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 147,
    name: "Rigid Industries E-Series Light Bar",
    category: "lighting",
    brand: "rigid-industries",
    price: 899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("rigid-industries-e-series-light-bar", [
      "/product-media/lights/rigid-industries-e-series-light-bar/1.jpg",
      "/product-media/lights/rigid-industries-e-series-light-bar/2.jpg",
      "/product-media/lights/rigid-industries-e-series-light-bar/3.jpg",
      "/product-media/lights/rigid-industries-e-series-light-bar/4.jpg",
      "/product-media/lights/rigid-industries-e-series-light-bar/5.jpg",
      "/product-media/lights/rigid-industries-e-series-light-bar/6.jpg",
    ]),
    description: `Rigid Industries E-Series Light Bar

Rigid Industries E-Series LED light bar with industry-leading output and rugged construction for off-road and utility use.

The Rigid Industries E-Series Light Bar is a benchmark in auxiliary lighting, delivering powerful forward illumination in a durable package trusted on trucks, Jeeps, and work vehicles. Ideal for anyone who needs serious light output with Rigid's proven reliability.

Specifications
• Part Type: LED Light Bar (E-Series)
• Output: High-Intensity Forward Lighting
• Housing: Extruded Aluminum, Polycarbonate Lens
• Beam Pattern: Spot / Flood / Combo Options (Confirm at Checkout)
• Fitment: Universal Mounting (Confirm Bracket at Checkout)
• Manufacturer: Rigid Industries

Highlights
• Industry-Benchmark LED Light Bar
• Rugged Extruded Aluminum Housing
• Powerful Off-Road Illumination
• Trusted Rigid Industries Quality
• Ideal for Trucks & Utility Vehicles

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 148,
    name: "Sequential LED Turn Signal Kit",
    category: "lighting",
    brand: "universal",
    price: 149,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("sequential-led-turn-signal-kit", [
      "/product-media/lights/sequential-led-turn-signal-kit/1.jpg",
      "/product-media/lights/sequential-led-turn-signal-kit/2.jpg",
      "/product-media/lights/sequential-led-turn-signal-kit/3.jpg",
    ]),
    description: `Sequential LED Turn Signal Kit

Sequential LED turn signal kit with animated sweep indicators for a modern, high-end lighting effect.

The Sequential LED Turn Signal Kit upgrades factory indicators with a smooth sequential sweep animation that mimics luxury and modern OEM designs. A popular mod for headlight and taillight assemblies on supported applications.

Specifications
• Part Type: Sequential Turn Signal Module / LED Kit
• Function: Animated Sequential Turn Indicators
• Control: Plug-and-Play Module on Supported Applications
• Fitment: Application-Specific (Confirm at Checkout)
• Compatibility: LED or Incandescent (Confirm at Checkout)
• Manufacturer: Universal

Highlights
• Animated Sequential Turn Signals
• Modern Luxury Lighting Effect
• Plug-and-Play on Supported Cars
• Popular Headlight/Tail Upgrade
• Standout Exterior Detail

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 149,
    name: "XK Glow Rock Lights",
    category: "lighting",
    brand: "xk-glow",
    price: 199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("xk-glow-rock-lights", [
      "/product-media/lights/xk-glow-rock-lights/1.jpg",
      "/product-media/lights/xk-glow-rock-lights/2.jpg",
      "/product-media/lights/xk-glow-rock-lights/3.jpg",
      "/product-media/lights/xk-glow-rock-lights/4.jpg",
    ]),
    description: `XK Glow Rock Lights

XK Glow rock light kit with RGB pods for underbody and wheel-well accent lighting on trucks and show builds.

The XK Glow Rock Lights add vivid RGB accent lighting with durable pods designed for underbody, wheel-well, and chassis mounting. Controlled via app or remote, they are a staple for show trucks and enthusiasts who want customizable ground effects.

Specifications
• Part Type: RGB Rock Light Kit
• Pods: Multiple Weather-Resistant LED Pods
• Control: App / Remote Color Selection
• Mounting: Underbody / Wheel-Well / Chassis
• Fitment: Universal Truck & SUV Application
• Manufacturer: XK Glow

Highlights
• RGB Rock Light Accent Pods
• App-Controlled Color Effects
• Show Truck Ground Lighting
• Durable Underbody Mounting
• Customizable Nighttime Look

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
];
