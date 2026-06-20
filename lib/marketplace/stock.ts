import {
  getStockRecord,
  upsertStockRecord,
} from "./persistence";

export const setStock = (productId: number, amount: number): void => {
  upsertStockRecord(productId, amount);
};

export const getStock = (productId: number): number => {
  return getStockRecord(productId)?.stock ?? 0;
};

export const reduceStock = (productId: number, amount: number): void => {
  const current = getStock(productId);
  upsertStockRecord(productId, Math.max(0, current - amount));
};

export const hasStock = (productId: number, quantity = 1): boolean => {
  return getStock(productId) >= quantity;
};
