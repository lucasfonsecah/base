"use client";

import { useState } from "react";
import { generateLinkCode } from "./actions";

export function GenerateCodeButton() {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    setError(null);
    const result = await generateLinkCode();
    setCode(result.code);
    setError(result.error);
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleClick}
        disabled={pending}
        className="self-start rounded-md bg-[var(--text-primary)] px-4 py-2 text-sm font-medium text-[var(--background)] disabled:opacity-60"
      >
        {pending ? "Gerando…" : code ? "Gerar novo código" : "Gerar código"}
      </button>

      {code && (
        <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-center">
          <p className="mb-1 text-xs text-[var(--text-secondary)]">No Discord, rode:</p>
          <code className="text-lg font-mono text-[var(--text-primary)]">
            /vincular codigo:{code}
          </code>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Válido por 10 minutos.</p>
        </div>
      )}

      {error && <p className="text-sm text-[var(--status-critical)]">{error}</p>}
    </div>
  );
}
