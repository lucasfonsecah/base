"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const initialState: AuthState = { error: null };

export default function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState,
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialState,
  );

  const state = mode === "in" ? signInState : signUpState;
  const action = mode === "in" ? signInAction : signUpAction;
  const pending = mode === "in" ? signInPending : signUpPending;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold text-[var(--text-primary)]">
          Minhas Finanças
        </h1>
        <p className="mb-6 text-sm text-[var(--text-secondary)]">
          {mode === "in" ? "Entre na sua conta" : "Crie sua conta"}
        </p>

        <div className="mb-6 flex gap-1 rounded-lg border border-[var(--border)] p-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("in")}
            className={`flex-1 rounded-md py-1.5 transition ${
              mode === "in"
                ? "bg-[var(--text-primary)] text-[var(--background)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setMode("up")}
            className={`flex-1 rounded-md py-1.5 transition ${
              mode === "up"
                ? "bg-[var(--text-primary)] text-[var(--background)]"
                : "text-[var(--text-secondary)]"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form action={action} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            E-mail
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Senha
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-1)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--series-1)]"
            />
          </label>

          {state.error && (
            <p className="text-sm text-[var(--status-critical)]">{state.error}</p>
          )}
          {state.info && (
            <p className="text-sm text-[var(--text-secondary)]">{state.info}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 rounded-md bg-[var(--series-1)] py-2 text-sm font-medium text-white transition disabled:opacity-60"
          >
            {pending ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
