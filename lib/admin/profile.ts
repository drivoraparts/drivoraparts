let adminDisplayName = "Drivora Admin";

export function getAdminDisplayName(): string {
  return adminDisplayName;
}

export function setAdminDisplayName(name: string): void {
  const trimmed = name.trim();
  adminDisplayName = trimmed || "Drivora Admin";
}

export type AdminProfile = {
  email: string;
  displayName: string;
};

export function getAdminProfile(email: string): AdminProfile {
  return {
    email,
    displayName: getAdminDisplayName(),
  };
}
