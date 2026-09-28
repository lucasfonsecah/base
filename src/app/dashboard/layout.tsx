import Link from "next/link";
import { signOut } from "@/app/login/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-6">
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          Minhas Finanças
        </span>
        <nav className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)]">
            Painel
          </Link>
          <Link
            href="/dashboard/transactions"
            className="hover:text-[var(--text-primary)]"
          >
            Lançamentos
          </Link>
          <Link href="/dashboard/chat" className="hover:text-[var(--text-primary)]">
            Chat
          </Link>
          <form action={signOut}>
            <button type="submit" className="hover:text-[var(--text-primary)]">
              Sair
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
