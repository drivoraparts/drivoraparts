import { permanentRedirect } from "next/navigation";
import { routes } from "@/lib/inventory/routes";

/*
 * /vehicles used to index 4x4 and ute platforms from nine makers. The
 * storefront now lists Toyota parts only, and the Toyota model selector is
 * the USA catalog view (Tacoma, Tundra, 4Runner, Land Cruiser and the rest,
 * each shown only where parts exist). Old links land there.
 *
 * The two Toyota platform hubs, /vehicles/toyota-hilux-4x4 and
 * /vehicles/toyota-landcruiser-70-series, are still published.
 */
export default function Page() {
  permanentRedirect(routes.market("usa"));
}
