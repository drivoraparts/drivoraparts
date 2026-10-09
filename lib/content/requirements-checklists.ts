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
};

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
  },
  fuel: {
    title: "Fuel system: what to plan for",
    items: [
      "Pump, injectors, rails, regulator and filters as the setup requires",
      "Lines, fittings and adapters sized for the system",
      "Wiring, relays and electrical supply for the pump",
      "Fuel grade and tuning to suit the engine and any added power",
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
  },
};
