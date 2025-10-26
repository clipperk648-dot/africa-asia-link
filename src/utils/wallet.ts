import { addWalletTransaction, getWalletBalance, getWalletTransactions, setWalletBalance } from "@/lib/db";

export type WalletTx = { id: string; type: "deposit" | "payment"; amount: number; currency: string; note?: string; date: string };

export const getBalance = (userId: string | null | undefined, currency = "USD"): number => {
  // Synchronous signature preserved for backward compatibility
  // Use a cached value if needed; for now, return 0 and rely on pages fetching live values via getWalletBalance
  console.warn("getBalance() is deprecated. Use getWalletBalance() from lib/db for async value.");
  return 0;
};

export const getLiveBalance = async (userId: string, currency = "USD") => {
  const res = await getWalletBalance(userId, currency);
  return res.balance;
};

export const setBalance = async (userId: string, amount: number, currency = "USD") => {
  await setWalletBalance(userId, amount, currency);
};

export const getTransactions = async (userId: string | null | undefined): Promise<WalletTx[]> => {
  if (!userId) return [];
  const rows = await getWalletTransactions(userId);
  return rows.map((r: any) => ({ id: String(r.id), type: r.type, amount: Number(r.amount), currency: r.currency, note: r.note || undefined, date: r.created_at }));
};

export const addTransaction = async (userId: string, tx: WalletTx) => {
  await addWalletTransaction(userId, { type: tx.type, amount: tx.amount, currency: tx.currency, note: tx.note });
};
