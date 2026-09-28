export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  occurred_on: string;
  created_at: string;
};

export type CategoryTotal = {
  category: string;
  total: number;
};

export type Summary = {
  income: number;
  expense: number;
  balance: number;
};
