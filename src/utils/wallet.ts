export type WalletTx = { id: string; type: "deposit" | "payment"; amount: number; currency: string; note?: string; date: string };

const balKey = (userId: string) => `wallet:balance:${userId}`;
const txKey = (userId: string) => `wallet:tx:${userId}`;

export const getBalance = (userId: string | null | undefined, currency = "USD"): number => {
  if (!userId) return 0;
  const raw = localStorage.getItem(`${balKey(userId)}:${currency}`);
  return raw ? Number(raw) : 0;
};

export const setBalance = (userId: string, amount: number, currency = "USD") => {
  localStorage.setItem(`${balKey(userId)}:${currency}`, String(amount));
};

export const getTransactions = (userId: string | null | undefined): WalletTx[] => {
  if (!userId) return [];
  const raw = localStorage.getItem(txKey(userId));
  return raw ? (JSON.parse(raw) as WalletTx[]) : [];
};

export const addTransaction = (userId: string, tx: WalletTx) => {
  const list = getTransactions(userId);
  list.unshift(tx);
  localStorage.setItem(txKey(userId), JSON.stringify(list));
};
