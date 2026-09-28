import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listTransactions } from "@/lib/finance/queries";
import { deleteTransaction } from "../actions";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function monthRange(month?: string) {
  const now = new Date();
  const [year, mon] = month
    ? month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const from = `${year}-${String(mon).padStart(2, "0")}-01`;
  const lastDay = new Date(year, mon, 0).getDate();
  const to = `${year}-${String(mon).padStart(2, "0")}-${lastDay}`;
  return { from, to, label: `${String(mon).padStart(2, "0")}/${year}` };
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { from, to, label } = monthRange(month);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const transactions = await listTransactions(supabase, user!.id, { from, to, limit: 200 });

  const prevMonth = new Date(from);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const nextMonth = new Date(from);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const toParam = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Lançamentos
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <Link
            href={`/dashboard/transactions?month=${toParam(prevMonth)}`}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← anterior
          </Link>
          <span className="font-medium text-[var(--text-primary)]">{label}</span>
          <Link
            href={`/dashboard/transactions?month=${toParam(nextMonth)}`}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            próximo →
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-1)]">
        {transactions.length === 0 ? (
          <p className="p-6 text-center text-sm text-[var(--text-muted)]">
            Nenhum lançamento nesse mês.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-secondary)]">
                <th className="px-4 py-2 font-normal">Data</th>
                <th className="px-4 py-2 font-normal">Categoria</th>
                <th className="px-4 py-2 font-normal">Nota</th>
                <th className="px-4 py-2 text-right font-normal">Valor</th>
                <th className="w-10 px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2 text-[var(--text-secondary)]">
                    {dateFmt.format(new Date(`${t.occurred_on}T00:00:00`))}
                  </td>
                  <td className="px-4 py-2 text-[var(--text-primary)]">{t.category}</td>
                  <td className="px-4 py-2 text-[var(--text-muted)]">
                    {t.description ?? "—"}
                  </td>
                  <td
                    className="px-4 py-2 text-right font-medium tabular-nums"
                    style={{
                      color:
                        t.type === "income"
                          ? "var(--status-good)"
                          : "var(--status-critical)",
                    }}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {currency.format(t.amount)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <form action={deleteTransaction.bind(null, t.id)}>
                      <button
                        type="submit"
                        aria-label="Excluir"
                        className="text-[var(--text-muted)] hover:text-[var(--status-critical)]"
                      >
                        ✕
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
