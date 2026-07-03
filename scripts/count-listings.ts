import { getAllProducts } from "../lib/inventory/index.js";

process.stdout.write(String(getAllProducts().length));
