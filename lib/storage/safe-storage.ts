const noopStorage: Storage = {
  get length() {
    return 0;
  },
  clear() {},
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {},
  setItem() {},
};

function probeStorage(storage: Storage): Storage | null {
  try {
    const probe = "__drivora_storage_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

/** localStorage wrapper — iOS private mode / strict settings can throw and crash hydration. */
export function getSafeLocalStorage(): Storage {
  if (typeof window === "undefined") return noopStorage;
  return probeStorage(window.localStorage) ?? noopStorage;
}

/** sessionStorage wrapper with the same Safari-safe probing. */
export function getSafeSessionStorage(): Storage {
  if (typeof window === "undefined") return noopStorage;
  return probeStorage(window.sessionStorage) ?? noopStorage;
}
