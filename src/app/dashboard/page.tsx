import { createClient } from "@/lib/supabase/server";
import {
  getDailyTrend,
  getSpendingByCategory,
  getSummary,
} from "@/lib/finance/queries";
import { daysAgoISO, startOfMonthISO, startOfWeekISO, todayISO } from "@/lib/finance/dates";
import { StatCard } from "./StatCard";
import { TransactionForm } from "./TransactionForm";
import { CategoryBarChart } from "./charts/CategoryBarChart";
import { TrendChart } from "./charts/TrendChart";

function foldTopCategories(
  data: { category: string; total: number }[],
  max = 7,
) {
  if (data.length <= max) return data;
  const top = data.slice(0, max);
  const rest = data.slice(max).reduce((sum, d) => sum + d.total, 0);
  return [...top, { category: "Outros", total: rest }];
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user!.id;

  const today = todayISO();
  const weekStart = startOfWeekISO();
  const monthStart = startOfMonthISO();
  const trendStart = daysAgoISO(29);

  const [weekSummary, monthSummary, weekByCategory, trend] = await Promise.all([
    getSummary(supabase, userId, { from: weekStart, to: today }),
    getSummary(supabase, userId, { from: monthStart, to: today }),
    getSpendingByCategory(supabase, userId, { from: weekStart, to: today }),
    getDailyTrend(supabase, userId, { from: trendStart, to: today }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Painel</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Resumo da semana e do mês atual.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <TransactionForm />

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Entradas (mês)" value={monthSummary.income} tone="good" />
            <StatCard
              label="Gastos (mês)"
              value={monthSummary.expense}
              tone="critical"
            />
            <StatCard label="Saldo (mês)" value={monthSummary.balance} />
          </div>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
            <h2 className="mb-1 text-sm font-medium text-[var(--text-primary)]">
              Onde você mais gastou essa semana
            </h2>
            <p className="mb-3 text-xs text-[var(--text-secondary)]">
              Total de gastos na semana:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(weekSummary.expense)}
            </p>
            <CategoryBarChart data={foldTopCategories(weekByCategory)} />
          </section>

          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
            <h2 className="mb-3 text-sm font-medium text-[var(--text-primary)]">
              Saldo diário (últimos 30 dias)
            </h2>
            <TrendChart data={trend} />
          </section>
        </div>
      </div>
    </div>
  );
}
