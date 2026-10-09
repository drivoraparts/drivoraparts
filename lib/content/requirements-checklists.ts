import type { RequirementsChecklistId } from "@/lib/inventory/types";

/**
 * Shared installation guidance, written once per kind of product.
 *
 * This is GENERAL guidance about what installing that kind of part usually
 * involves. It is never a statement about what a particular listing includes,
 * and it makes no compatibility claim: what a package contains comes only from
 * the listing's own structured contents (PackageContents), and compatibility
 * from its fitment. The page says so beside every checklist.
 *
 * Items are phrased as things to plan for ("suited to the engine"), not as
 * specifications, so none of them can be read as a promise about a product.
 */
export type RequirementsChecklist = {
  title: string;
  items: string[];
  /** What to check, and have to hand, before ordering this kind of product. */
  verify: string[];
};

/** Shown under every checklist: the owner's statement of supplier capability. */
export const SUPPLIER_SUPPORT_NOTE =
  "Supporting components for this kind of installation can be sourced through our supplier network. Send us the details above and tell us which parts you need.";

export const CHECKLIST_DISCLAIMER =
  "General guidance only. It is not a list of what comes with this listing, not every item applies to every installation, and it does not state that any part is compatible with your vehicle.";

export const REQUIREMENTS_CHECKLISTS: Record<RequirementsChecklistId, RequirementsChecklist> = {
  engine: {
    title: "Installing an engine: what to plan for",
    items: [
      "Engine mounts and mounting compatibility with your vehicle",
      "Transmission compatibility, including the bellhousing pattern and any adapter",
      "Flywheel or flexplate, and starter compatibility",
      "A cooling system suited to the engine, with the right hoses and connections",
      "Exhaust connections from the manifolds or headers onward",
      "Fuel delivery suited to the engine: supply, lines and pressure regulation",
      "ECU or PCM, wiring harness, sensors, connectors and any control modules the engine needs",
      "ECU calibration or tuning for your application",
      "Vehicle integration: gauges, immobilizer or security system, electronic throttle and accelerator pedal",
      "Accessory drive (belts, pulleys, alternator, power steering) and electrical connections",
      "Adapters, brackets, hoses and fittings specific to your vehicle or conversion",
    ],
    verify: [
      "Vehicle year, make, model, trim and VIN",
      "Your current engine code, and whether it is the original engine",
      "The transmission type, model and code it will be paired with",
      "Drivetrain layout (RWD, AWD or 4WD) and the engine mounting arrangement",
      "Whether the vehicle has an immobilizer or security system that has to work with the ECU",
      "Whether this is a like-for-like replacement or a conversion or performance build",
      "The fuel, cooling and exhaust setup you plan to use",
    ],
  },
  transmission: {
    title: "Installing a transmission: what to plan for",
    items: [
      "Torque converter (automatic) or clutch assembly (manual)",
      "Flexplate or flywheel, and the bellhousing or adapter that matches your engine",
      "Transmission control module (TCM or TCU), wiring harness and connectors, where the unit is electronically controlled",
      "Shifter and selector linkage",
      "Transmission mounts and crossmember",
      "Driveshaft and output-shaft compatibility",
      "Transfer-case compatibility on four-wheel-drive vehicles",
      "Cooling lines and transmission cooler",
      "The correct fluid and any servicing the unit calls for",
      "Programming, calibration or ECU/TCU integration, where the control system requires it",
    ],
    verify: [
      "Vehicle year, make, model, trim and VIN",
      "Engine code and displacement it will be bolted to",
      "Your current transmission model and code (and its casting or part number)",
      "Drivetrain layout and, for 4WD, the transfer case and axle arrangement",
      "Bellhousing pattern, and torque converter or clutch requirements",
      "Whether the unit needs a control module or programming to work with your vehicle",
    ],
  },
  turbocharger: {
    title: "Installing a turbocharger: what to plan for",
    items: [
      "Oil feed and drain lines, and fittings",
      "Intake and charge-air piping, and an intercooler where the setup uses one",
      "Exhaust connections: manifold, up-pipe or downpipe",
      "Boost control: wastegate or actuator, bypass or blow-off valve, and any controller",
      "Fueling and engine-management changes or tuning for the added boost",
      "Mounting hardware, gaskets and heat protection",
      "Coolant connections, where the turbocharger is water-cooled",
    ],
    verify: [
      "Engine code, displacement and model year",
      "The part number of the turbocharger being replaced, if any",
      "Fuel type, and the emissions equipment fitted to the vehicle",
      "Your tuning and fueling plan for the added or changed boost",
    ],
  },
  supercharger: {
    title: "Installing a supercharger: what to plan for",
    items: [
      "Drive system: belt, pulley and mounting brackets",
      "Intake manifold and throttle-body arrangement",
      "Intercooler or heat exchanger, and its coolant circuit where the setup uses one",
      "Fuel system capacity: injectors and pump",
      "ECU calibration or tuning for the added boost",
      "Bypass or boost-control arrangement",
      "Clearance and fitment around the engine bay",
    ],
    verify: [
      "Engine code, displacement and model year",
      "Your intake manifold and throttle-body arrangement",
      "Fuel system capacity (injectors and pump) against the power target",
      "Your tuning plan for the added boost",
    ],
  },
  suspension: {
    title: "Installing suspension: what to plan for",
    items: [
      "Springs, shocks, struts and arms for each corner the kit covers",
      "Mounting hardware and any brackets",
      "Wheel and tire clearance after the change",
      "A professional alignment after installation",
      "Brake lines, sway-bar links and driveline angles on lifted or lowered vehicles",
    ],
    verify: [
      "Vehicle year, make, model, trim and chassis or generation",
      "Body style, and 2WD or 4WD",
      "Front or rear axle, and left or right side where it applies",
      "How much lift or drop you want, and the load you carry or tow",
      "Wheel and tire size",
    ],
  },
  brakes: {
    title: "Installing brakes: what to plan for",
    items: [
      "Calipers, rotors, pads and brackets for each axle the kit covers",
      "Brake hoses and mounting hardware",
      "Fluid and a full bleed after installation",
      "Wheel clearance around the caliper and rotor",
      "Master-cylinder and pedal compatibility with the new brakes",
    ],
    verify: [
      "Vehicle year, make, model and trim",
      "Front or rear axle",
      "Current rotor size and caliper type",
      "Wheel size and offset, for clearance",
    ],
  },
  fuel: {
    title: "Fuel system: what to plan for",
    items: [
      "Pump, injectors, rails, regulator and filters as the setup requires",
      "Lines, fittings and adapters sized for the system",
      "Wiring, relays and electrical supply for the pump",
      "Fuel grade and tuning to suit the engine and any added power",
    ],
    verify: [
      "Engine code and fuel type",
      "Your power target",
      "The current pump, injector and regulator part numbers",
    ],
  },
  cooling: {
    title: "Cooling system: what to plan for",
    items: [
      "Radiator or cooler, hoses and clamps",
      "Fan and shroud, where the setup uses them",
      "Water pump, thermostat and housing",
      "Coolant and a proper bleed after installation",
      "Mounting hardware and sensor connections",
    ],
    verify: [
      "Vehicle year, make, model and engine",
      "Manual or automatic transmission, and whether the vehicle has air conditioning",
      "How the vehicle is used (towing, track or daily)",
    ],
  },
  drivetrain: {
    title: "Installing drivetrain parts: what to plan for",
    items: [
      "Mounting points and compatibility with your drivetrain layout",
      "Gear ratio matched front to rear and to the transmission",
      "Driveshafts and their length and yoke compatibility",
      "Fluids for the unit",
      "Fasteners and any adapters or hardware the installation needs",
    ],
    verify: [
      "Vehicle year, make, model and drivetrain layout",
      "Transmission model and the output or input spline count",
      "Gear ratio of the unit you are replacing or matching",
      "Existing driveshaft length and yoke type",
    ],
  },
};
