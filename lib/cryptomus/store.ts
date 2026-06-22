import type { CryptomusPaymentRecord } from "./types";

type CryptomusStore = {
  payments: CryptomusPaymentRecord[];
};

const STORE_KEY = "__drivora_cryptomus_store__";

function getStore(): CryptomusStore {
  const g = globalThis as typeof globalThis & {
    [STORE_KEY]?: CryptomusStore;
  };

  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { payments: [] };
  }

  return g[STORE_KEY]!;
}

export function savePayment(record: CryptomusPaymentRecord): CryptomusPaymentRecord {
  getStore().payments.push(record);
  return record;
}

export function updatePayment(
  id: string,
  patch: Partial<CryptomusPaymentRecord>
): CryptomusPaymentRecord | undefined {
  const payment = getStore().payments.find((item) => item.id === id);
  if (!payment) return undefined;

  Object.assign(payment, patch, { updatedAt: Date.now() });
  return payment;
}

export function findPaymentByOrderId(orderId: string): CryptomusPaymentRecord | undefined {
  return getStore().payments.find((item) => item.orderId === orderId);
}

export function findPaymentByUuid(uuid: string): CryptomusPaymentRecord | undefined {
  return getStore().payments.find((item) => item.uuid === uuid);
}

export function getPayments(): CryptomusPaymentRecord[] {
  return [...getStore().payments].sort((a, b) => b.createdAt - a.createdAt);
}
