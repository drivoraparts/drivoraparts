import { getInventory, hasInventory, reduceInventory, setInventory } from "@/lib/db/inventory";

export const setStock = async (productId: number, amount: number): Promise<void> => {
  await setInventory(productId, amount);
};

export const getStock = async (productId: number): Promise<number> => {
  return getInventory(productId);
};

export const reduceStock = async (
  productId: number,
  amount: number
): Promise<boolean> => {
  return reduceInventory(productId, amount);
};

export const hasStock = async (productId: number, quantity = 1): Promise<boolean> => {
  return hasInventory(productId, quantity);
};
