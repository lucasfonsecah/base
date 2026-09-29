import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryTotal, Summary, Transaction, TransactionType } from "./types";

export type DateRange = { from?: string; to?: string };

type ListFilters = DateRange & {
  type?: TransactionType;
  category?: string;
  limit?: number;
};

export async function listTransactions(
  supabase: SupabaseClient,
  userId: string,
  filters: ListFilters = {},
): Promise<Transaction[]> {
  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.from) query = query.gte("occurred_on", filters.from);
  if (filters.to) query = query.lte("occurred_on", filters.to);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export type NewTransaction = {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  occurred_on: string;
};

export async function insertTransaction(
  supabase: SupabaseClient,
  userId: string,
  input: NewTransaction,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      type: input.type,
      amount: input.amount,
      category: input.category,
      description: input.description || null,
      occurred_on: input.occurred_on,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSummary(
  supabase: SupabaseClient,
  userId: string,
  range: DateRange = {},
): Promise<Summary> {
  let query = supabase.from("transactions").select("type, amount").eq("user_id", userId);
  if (range.from) query = query.gte("occurred_on", range.from);
  if (range.to) query = query.lte("occurred_on", range.to);

  const { data, error } = await query;
  if (error) throw error;

  let income = 0;
  let expense = 0;
  for (const row of data ?? []) {
    if (row.type === "income") income += Number(row.amount);
    else expense += Number(row.amount);
  }

  return { income, expense, balance: income - expense };
}

export async function getSpendingByCategory(
  supabase: SupabaseClient,
  userId: string,
  range: DateRange = {},
  type: TransactionType = "expense",
): Promise<CategoryTotal[]> {
  let query = supabase
    .from("transactions")
    .select("category, amount")
    .eq("user_id", userId)
    .eq("type", type);
  if (range.from) query = query.gte("occurred_on", range.from);
  if (range.to) query = query.lte("occurred_on", range.to);

  const { data, error } = await query;
  if (error) throw error;

  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    totals.set(row.category, (totals.get(row.category) ?? 0) + Number(row.amount));
  }

  return Array.from(totals, ([category, total]) => ({ category, total })).sort(
    (a, b) => b.total - a.total,
  );
}

/** Daily net (income - expense) for each day in the range, oldest first. */
export async function getDailyTrend(
  supabase: SupabaseClient,
  userId: string,
  range: DateRange = {},
): Promise<{ date: string; net: number }[]> {
  let query = supabase
    .from("transactions")
    .select("occurred_on, type, amount")
    .eq("user_id", userId);
  if (range.from) query = query.gte("occurred_on", range.from);
  if (range.to) query = query.lte("occurred_on", range.to);

  const { data, error } = await query;
  if (error) throw error;

  const byDay = new Map<string, number>();
  for (const row of data ?? []) {
    const delta = row.type === "income" ? Number(row.amount) : -Number(row.amount);
    byDay.set(row.occurred_on, (byDay.get(row.occurred_on) ?? 0) + delta);
  }

  return Array.from(byDay, ([date, net]) => ({ date, net })).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}
