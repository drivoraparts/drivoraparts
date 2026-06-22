const DEFAULT_ADMIN_EMAIL = "admin@drivoraparts.com";
const DEFAULT_ADMIN_PASSWORD = "Drivora@12345!";
const DEFAULT_AUTH_SECRET = "drivora-dev-auth-secret-change-me";

let warnedDefaults = false;
let cachedConfig: ResolvedAdminConfig | null = null;

export type ResolvedAdminConfig = {
  email: string;
  password: string;
  authSecret: string;
  usingDefaults: boolean;
};

export function ensureAdminInitialized(): ResolvedAdminConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const envEmail = process.env.ADMIN_EMAIL?.trim();
  const envPassword = process.env.ADMIN_PASSWORD;
  const envSecret = process.env.AUTH_SECRET?.trim();

  const usingDefaults = !envEmail || !envPassword || !envSecret;

  if (usingDefaults && !warnedDefaults) {
    console.warn(
      "⚠️ Default admin credentials used — change ADMIN_EMAIL, ADMIN_PASSWORD, and AUTH_SECRET in production"
    );
    warnedDefaults = true;
  }

  cachedConfig = {
    email: (envEmail || DEFAULT_ADMIN_EMAIL).toLowerCase(),
    password: envPassword || DEFAULT_ADMIN_PASSWORD,
    authSecret: envSecret || DEFAULT_AUTH_SECRET,
    usingDefaults,
  };

  return cachedConfig;
}

export function getDefaultAdminEmail(): string {
  return DEFAULT_ADMIN_EMAIL;
}
