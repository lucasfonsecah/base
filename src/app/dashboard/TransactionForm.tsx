"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTransaction, type FormState } from "./actions";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "@/lib/finance/categories";

const initialState: FormState = { error: null };

function todayLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function TransactionForm() {
  const [state, action, pending] = useActionState(addTransaction, initialState);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [category, setCategory] = useState("");
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      setCategory("");
    }
    wasPending.current = pending;
  }, [pending, state]);

  const categories =
    type === "expense" ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4"
    >
      <div className="flex gap-1 rounded-lg border border-[var(--border)] p-1 text-sm">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 rounded-md py-1.5 transition ${
            type === "expense"
              ? "bg-[var(--status-critical)] text-white"
              : "text-[var(--text-secondary)]"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 rounded-md py-1.5 transition ${
            type === "income"
              ? "bg-[var(--status-good)] text-white"
              : "text-[var(--text-secondary)]"
          }`}
        >
          Entrada
        </button>
      </div>
      <input type="hidden" name="type" value={type} />

      <label className="flex flex-col gap-1 text-sm">
        Valor (R$)
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0,00"
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]"
        />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        Categoria
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                category === c
                  ? "border-[var(--series-1)] bg-[var(--series-1)] text-white"
                  : "border-[var(--border)] text-[var(--text-secondary)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          name="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          placeholder="Ou digite uma categoria"
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]"
        />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Data
        <input
          name="occurred_on"
          type="date"
          defaultValue={todayLocalISO()}
          required
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Nota (opcional)
        <input
          name="description"
          type="text"
          placeholder="Ex: mercado do mês"
          className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]"
        />
      </label>

      {state.error && (
        <p className="text-sm text-[var(--status-critical)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[var(--text-primary)] py-2 text-sm font-medium text-[var(--background)] transition disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Adicionar"}
      </button>
    </form>
  );
}
