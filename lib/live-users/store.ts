import type { LiveSession } from "./types";

type LiveUsersStore = {
  sessions: Map<string, LiveSession>;
};

const STORE_KEY = "__drivora_live_users_store__";
export const SESSION_TTL_MS = 45_000;

function getStore(): LiveUsersStore {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: LiveUsersStore;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { sessions: new Map() };
  }

  return g[STORE_KEY]!;
}

export function upsertSession(session: LiveSession): LiveSession {
  getStore().sessions.set(session.sessionId, session);
  return session;
}

export function getActiveSessions(now = Date.now()): LiveSession[] {
  const store = getStore();
  const active: LiveSession[] = [];

  for (const [id, session] of store.sessions.entries()) {
    if (now - session.lastSeenAt > SESSION_TTL_MS) {
      store.sessions.delete(id);
      continue;
    }
    active.push(session);
  }

  return active;
}
