let tokenVersion = 1;

export function getAdminTokenVersion(): number {
  return tokenVersion;
}

export function bumpAdminTokenVersion(): number {
  tokenVersion += 1;
  return tokenVersion;
}
