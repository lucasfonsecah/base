const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function StatCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "neutral" | "good" | "critical";
}) {
  const color =
    tone === "good"
      ? "var(--status-good)"
      : tone === "critical"
        ? "var(--status-critical)"
        : "var(--text-primary)";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold" style={{ color }}>
        {currency.format(value)}
      </p>
    </div>
  );
}
