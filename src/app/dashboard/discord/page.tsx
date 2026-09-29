import { createClient } from "@/lib/supabase/server";
import { GenerateCodeButton } from "./GenerateCodeButton";

export default async function DiscordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: link } = await supabase
    .from("discord_links")
    .select("created_at")
    .eq("user_id", user!.id)
    .maybeSingle();

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Discord</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Converse com o assistente direto pelo Discord.
        </p>
      </div>

      {link ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
          <p className="text-sm text-[var(--status-good)]">
            ✓ Sua conta está vinculada ao Discord.
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Vinculado em{" "}
            {new Date(link.created_at).toLocaleDateString("pt-BR")}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4">
          <p className="text-sm text-[var(--text-primary)]">
            Gere um código de uso único e rode{" "}
            <code className="rounded bg-[var(--background)] px-1 py-0.5">
              /vincular codigo:XXXXXX
            </code>{" "}
            no Discord pra conectar sua conta.
          </p>
          <GenerateCodeButton />
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-1)] p-4 text-sm text-[var(--text-secondary)]">
        <p>
          Depois de vinculado, use{" "}
          <code className="rounded bg-[var(--background)] px-1 py-0.5">
            /pergunta texto:...
          </code>{" "}
          no Discord — funciona igual ao chat do site: pode perguntar, pedir um
          relatório, um plano de ação, ou registrar um gasto/entrada direto pela
          conversa.
        </p>
      </div>
    </div>
  );
}
