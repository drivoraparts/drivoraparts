import type { Product } from "./types";

function media(slug: string, count = 4) {
  const base = `/product-media/electronics/${slug}`;
  const images = Array.from({ length: count }, (_, i) => `${base}/${i + 1}.jpg`);
  return { thumbnail: images[0], images };
}

export const electronicsProducts: Product[] = [
  {
    id: 121,
    name: "AEM Wideband AFR Gauge",
    category: "electronics",
    brand: "aem",
    price: 249,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("aem-wideband-afr-gauge"),
    description: `AEM Wideband AFR Gauge

AEM wideband UEGO gauge kit for accurate air/fuel ratio monitoring during tuning and track use.

The AEM Wideband AFR Gauge delivers fast, reliable lambda readings with a calibrated Bosch LSU 4.9 sensor and digital display. Essential for turbo and flex-fuel builds, it helps protect your engine by showing real-time mixture data for safe tuning and consistent performance.

Specifications
• Part Type: Wideband AFR Gauge Kit
• Sensor: Bosch LSU 4.9 UEGO
• Display: Digital AFR / Lambda Readout
• Output: 0–5V Analog for ECU/Data Logging
• Fitment: Universal (Confirm Mounting at Checkout)
• Manufacturer: AEM

Highlights
• Accurate Wideband AFR Monitoring
• Fast-Response LSU 4.9 Sensor
• Ideal for Turbo & Flex-Fuel Tuning
• 0–5V Output for ECU Integration
• Trusted AEM Quality

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 122,
    name: "COBB Accessport",
    category: "electronics",
    brand: "cobb",
    price: 699,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("cobb-accessport", 5),
    description: `COBB Accessport

COBB Accessport handheld tuner with pre-loaded maps, data logging, and performance calibration for supported platforms.

The COBB Accessport is the industry-standard flash tuning device for Subaru, Ford, VW/Audi, and other supported vehicles. Load stage maps, monitor critical parameters, and datalog runs — all from one portable unit with a clear color display and intuitive menu system.

Specifications
• Part Type: Handheld ECU Tuner / Monitor
• Functions: Flash Tuning, Data Logging, Diagnostics
• Display: Color LCD Interface
• Storage: On-Device Map & Log Storage
• Fitment: Vehicle-Specific (Confirm Platform at Checkout)
• Manufacturer: COBB Tuning

Highlights
• Industry-Standard Flash Tuner
• Pre-Loaded Performance Maps
• Built-In Data Logging
• Real-Time Parameter Monitoring
• Portable Handheld Design

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 123,
    name: "Dash Camera",
    category: "electronics",
    brand: "universal",
    price: 299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("dash-camera"),
    description: `Dash Camera

High-definition dash camera with loop recording, G-sensor event capture, and wide-angle front coverage.

The Dash Camera records crisp HD footage for daily driving security and incident documentation. With automatic loop recording, parking-mode options on select setups, and a wide field of view, it is a practical upgrade for street, track-day transport, and fleet vehicles.

Specifications
• Part Type: Front Dash Camera
• Resolution: Full HD Recording
• Lens: Wide-Angle Coverage
• Features: Loop Recording, G-Sensor Event Lock
• Power: 12V Hardwire or Cigarette Adapter
• Manufacturer: Universal

Highlights
• HD Incident Documentation
• Loop Recording with Event Protection
• Wide-Angle Road Coverage
• Easy Windshield Mounting
• Ideal Daily Driver Accessory

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 124,
    name: "Digital Dash Display",
    category: "electronics",
    brand: "universal",
    price: 1299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("digital-dash-display", 5),
    description: `Digital Dash Display

Configurable digital dash display with customizable gauges, shift lights, and sensor inputs for modern cockpit upgrades.

The Digital Dash Display replaces cluttered factory gauges with a sharp, programmable screen showing boost, oil pressure, coolant temp, speed, and more. Ideal for track builds and show cars, it delivers race-style data presentation with street-friendly brightness and layout options.

Specifications
• Part Type: Digital Gauge Cluster / Display
• Inputs: Multiple Analog & CAN Sensor Channels
• Display: High-Brightness Programmable Screen
• Layouts: Customizable Gauge Pages
• Fitment: Universal (Confirm Mounting at Checkout)
• Manufacturer: Universal

Highlights
• Customizable Digital Gauge Layouts
• Multiple Sensor Input Channels
• Race-Style Data Presentation
• Bright, Readable Display
• Modern Cockpit Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 125,
    name: "Electronic Boost Controller",
    category: "electronics",
    brand: "universal",
    price: 349,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("electronic-boost-controller"),
    description: `Electronic Boost Controller

Electronic boost controller for precise wastegate duty-cycle management and repeatable boost targets.

The Electronic Boost Controller lets you dial in boost levels with electronic solenoid control rather than manual bleed valves. With adjustable duty cycles and ramp settings, it delivers consistent boost pressure for street and track turbo setups.

Specifications
• Part Type: Electronic Boost Controller (EBC)
• Control: Solenoid Duty-Cycle Management
• Adjustment: Boost Target & Ramp Settings
• Inputs: MAP/Boost Reference Compatible
• Fitment: Universal Turbo Applications
• Manufacturer: Universal

Highlights
• Precise Electronic Boost Control
• Repeatable Boost Targets
• Solenoid-Based Wastegate Management
• Street & Track Turbo Compatible
• Replaces Manual Bleed Systems

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 126,
    name: "Flex Fuel Sensor Kit",
    category: "electronics",
    brand: "universal",
    price: 219,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("flex-fuel-sensor-kit"),
    description: `Flex Fuel Sensor Kit

Flex fuel sensor kit with ethanol content sensor, harness, and fittings for E85 and flex-fuel tuning.

The Flex Fuel Sensor Kit measures ethanol content in real time so your ECU can adjust fueling and timing automatically. Includes the sensor, wiring, and hardware needed for a clean install on supported fuel systems and tuning platforms.

Specifications
• Part Type: Flex Fuel / Ethanol Content Sensor Kit
• Sensor: GM-Style Ethanol Content Sensor
• Output: Frequency Signal for ECU Integration
• Includes: Sensor, Harness & Fittings
• Fitment: Universal (Confirm Fuel Line Size at Checkout)
• Manufacturer: Universal

Highlights
• Real-Time Ethanol Content Sensing
• Enables Automatic Flex-Fuel Tuning
• Complete Sensor & Harness Kit
• E85 & Pump-Gas Blends Supported
• Essential for Flex-Fuel Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 127,
    name: "Haltech Elite ECU",
    category: "electronics",
    brand: "haltech",
    price: 3299,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("haltech-elite-ecu", 6),
    description: `Haltech Elite ECU

Haltech Elite standalone ECU with advanced tuning, data logging, and motorsport-grade I/O for high-performance engine management.

The Haltech Elite ECU is a flagship engine management platform with extensive inputs/outputs, onboard logging, and powerful tuning software. Built for serious street, drag, and circuit applications, it supports complex fuel, ignition, and boost strategies with OEM-level reliability.

Specifications
• Part Type: Standalone Engine Management ECU
• Platform: Haltech Elite Series
• I/O: Extensive Analog, Digital & CAN Channels
• Tuning: Haltech NSP Software
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Haltech

Highlights
• Motorsport-Grade Engine Management
• Advanced Tuning & Data Logging
• Extensive Sensor & Output Support
• Haltech NSP Tuning Software
• Proven on Street & Race Builds

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 128,
    name: "Haltech Nexus ECU",
    category: "electronics",
    brand: "haltech",
    price: 2199,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("haltech-nexus-ecu", 5),
    description: `Haltech Nexus ECU

Haltech Nexus ECU combining powerful engine control with integrated display capability and modern connectivity.

The Haltech Nexus ECU streamlines high-performance engine management with an integrated approach to tuning, logging, and driver display. Ideal for enthusiasts who want Haltech control with a cleaner install and modern feature set for street and track use.

Specifications
• Part Type: Standalone Engine Management ECU
• Platform: Haltech Nexus Series
• Features: Integrated Display & Connectivity Options
• Tuning: Haltech NSP Software
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: Haltech

Highlights
• Integrated ECU & Display Platform
• Modern Haltech Nexus Architecture
• Powerful Tuning & Logging Tools
• Cleaner High-Performance Installs
• Street & Track Capable

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 129,
    name: "HP Tuners MPVI3",
    category: "electronics",
    brand: "hp-tuners",
    price: 449,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("hp-tuners-mpvi3", 5),
    description: `HP Tuners MPVI3

HP Tuners MPVI3 interface for GM, Ford, and supported platform tuning, logging, and diagnostics via VCM Suite.

The HP Tuners MPVI3 is the latest-generation tuning interface for reading, writing, and logging supported factory ECUs. Paired with VCM Suite, it enables performance calibrations, parameter monitoring, and comprehensive data analysis for modern muscle and performance vehicles.

Specifications
• Part Type: OBD Tuning Interface (MPVI3)
• Software: HP Tuners VCM Suite
• Functions: Read/Write Calibrations, Data Logging
• Connectivity: High-Speed USB
• Fitment: Platform-Specific (Confirm Vehicle at Checkout)
• Manufacturer: HP Tuners

Highlights
• Latest MPVI3 Tuning Interface
• VCM Suite Read/Write & Logging
• Supported GM, Ford & More Platforms
• Fast USB Connection
• Industry-Standard Tuning Tool

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 130,
    name: "MSD Ignition System",
    category: "electronics",
    brand: "msd",
    price: 599,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("msd-ignition-system", 5),
    description: `MSD Ignition System

MSD ignition upgrade with capacitive discharge ignition for stronger spark, cleaner idle, and improved high-RPM performance.

The MSD Ignition System delivers multiple sparks at lower RPM and a powerful single spark at high RPM for improved combustion efficiency. A proven upgrade for carbureted and early EFI builds, it helps unlock smoother throttle response and better ignition stability under boost.

Specifications
• Part Type: Performance Ignition System
• Technology: Capacitive Discharge Ignition
• Compatibility: MSD Distributor / Coil Applications
• RPM: Multi-Spark at Low RPM, Single Spark High RPM
• Fitment: Application-Specific (Confirm at Checkout)
• Manufacturer: MSD

Highlights
• Capacitive Discharge Ignition Technology
• Stronger Spark for Performance Builds
• Improved High-RPM Ignition Stability
• Proven MSD Engineering
• Ideal for Boosted & High-Compression Engines

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 131,
    name: "Performance Data Logger",
    category: "electronics",
    brand: "universal",
    price: 899,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("performance-data-logger", 5),
    description: `Performance Data Logger

Professional-grade data logger capturing GPS, sensor, and vehicle telemetry for track analysis and tuning validation.

The Performance Data Logger records lap times, speed, G-forces, and external sensor data for detailed post-session analysis. Built for track days and development work, it helps drivers and tuners identify gains, diagnose issues, and validate setup changes with hard data.

Specifications
• Part Type: Vehicle Data Logger
• Channels: GPS, Accelerometer & External Sensor Inputs
• Storage: Onboard Session Recording
• Analysis: Compatible with Common Motorsport Software
• Mounting: Universal Dash / Roll-Bar Mount Options
• Manufacturer: Universal

Highlights
• Comprehensive Track Data Capture
• GPS & G-Force Logging
• External Sensor Input Support
• Post-Session Analysis Ready
• Essential for Serious Track Use

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 132,
    name: "Professional OBD2 Scan Tool",
    category: "electronics",
    brand: "universal",
    price: 279,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("professional-obd2-scan-tool"),
    description: `Professional OBD2 Scan Tool

Professional OBD2 scan tool for live data, DTC reading/clearing, and advanced diagnostics on modern vehicles.

The Professional OBD2 Scan Tool goes beyond basic code readers with bi-directional tests, live parameter streaming, and manufacturer-specific PID support on compatible vehicles. A must-have for enthusiasts and shops diagnosing check-engine issues and verifying repairs.

Specifications
• Part Type: OBD2 Diagnostic Scan Tool
• Protocols: OBD-II / CAN Supported
• Functions: Read/Clear DTCs, Live Data, Tests
• Display: Color Screen Interface
• Fitment: Universal OBD2-Equipped Vehicles (1996+)
• Manufacturer: Universal

Highlights
• Advanced OBD2 Diagnostics
• Live Parameter Streaming
• Read & Clear Trouble Codes
• Bi-Directional Tests on Supported Vehicles
• Enthusiast & Shop Ready

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 133,
    name: "Shift Light Kit",
    category: "electronics",
    brand: "universal",
    price: 149,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("shift-light-kit", 3),
    description: `Shift Light Kit

Programmable LED shift light kit with adjustable RPM threshold for consistent upshifts during performance driving.

The Shift Light Kit provides a bright, easy-to-see RPM warning so you can shift at the optimal point without taking your eyes off the road or track. Adjustable activation RPM and compact mounting make it a simple but effective upgrade for manual and auto performance builds.

Specifications
• Part Type: Programmable Shift Light
• Display: High-Brightness LED Array
• Adjustment: User-Set Activation RPM
• Inputs: Tach / ECU Signal Compatible
• Fitment: Universal (Confirm Signal Source at Checkout)
• Manufacturer: Universal

Highlights
• Bright LED Shift Warning
• Adjustable Activation RPM
• Compact Windshield or Dash Mount
• Track & Street Performance Aid
• Simple Effective Upgrade

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
  {
    id: 134,
    name: "TPMS Kit",
    category: "electronics",
    brand: "universal",
    price: 189,
    stock: true,
    condition: "brand-new",
    warranty: "24-Month Limited Warranty",
    location: "USA Warehouse",
    ...media("tpms-kit", 3),
    description: `TPMS Kit

Tire pressure monitoring system kit with sensors and display for real-time pressure and temperature alerts.

The TPMS Kit monitors tire pressure and temperature to help prevent blowouts, uneven wear, and pressure loss on street and track vehicles. Ideal for aftermarket wheels or vehicles without factory TPMS, it provides audible and visual warnings when limits are exceeded.

Specifications
• Part Type: Tire Pressure Monitoring System
• Sensors: Valve-Stem Style TPMS Sensors
• Display: In-Cabin Monitor with Alerts
• Monitoring: Pressure & Temperature
• Fitment: Universal (Confirm Wheel Compatibility at Checkout)
• Manufacturer: Universal

Highlights
• Real-Time Tire Pressure Monitoring
• Temperature Alert Capability
• Aftermarket Wheel Compatible
• Helps Prevent Pressure-Related Failures
• Easy Enthusiast Installation

Warranty
24-Month Limited Warranty

Shipping
Worldwide Shipping Available`,
  },
];
