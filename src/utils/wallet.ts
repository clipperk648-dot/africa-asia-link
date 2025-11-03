import { addWalletTransaction, getWalletBalance, getWalletTransactions, setWalletBalance } from "@/lib/db";

export type WalletTx = { id: string; type: "deposit" | "payment"; amount: number; currency: string; note?: string; date: string };

// Mock in-memory cache for wallet data
const walletCache: Map<string, Map<string, number>> = new Map();
const transactionsCache: Map<string, WalletTx[]> = new Map();

export const getBalance = (userId: string | null | undefined, currency = "USD"): number => {
  if (!userId) return 0;
  const userCache = walletCache.get(userId) || new Map();
  return userCache.get(currency) || 0;
};

export const getLiveBalance = async (userId: string, currency = "USD") => {
  const res = await getWalletBalance(userId, currency);
  // Update cache
  if (!walletCache.has(userId)) walletCache.set(userId, new Map());
  walletCache.get(userId)!.set(currency, res.balance);
  return res.balance;
};

export const setBalance = async (userId: string, amount: number, currency = "USD") => {
  await setWalletBalance(userId, amount, currency);
  // Update cache
  if (!walletCache.has(userId)) walletCache.set(userId, new Map());
  walletCache.get(userId)!.set(currency, amount);
};

export const getTransactions = (userId: string | null | undefined): WalletTx[] => {
  if (!userId) return [];
  return transactionsCache.get(userId) || [];
};

export const getTransactionsAsync = async (userId: string | null | undefined): Promise<WalletTx[]> => {
  if (!userId) return [];
  const rows = await getWalletTransactions(userId);
  const txs = rows.map((r: any) => ({ id: String(r.id), type: r.type, amount: Number(r.amount), currency: r.currency, note: r.note || undefined, date: r.created_at }));
  transactionsCache.set(userId, txs);
  return txs;
};

export const addTransaction = async (userId: string, tx: WalletTx) => {
  await addWalletTransaction(userId, { type: tx.type, amount: tx.amount, currency: tx.currency, note: tx.note });
  // Update cache
  const existing = transactionsCache.get(userId) || [];
  transactionsCache.set(userId, [tx, ...existing]);
};
