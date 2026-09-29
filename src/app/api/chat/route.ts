import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ChatTurnLimitError, runChat } from "@/lib/chat/runChat";

export async function POST(request: Request) {
  try {
    return await handleChat(request);
  } catch (err) {
    console.error("chat route error", err);
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "Chave da Anthropic inválida ou ausente (ANTHROPIC_API_KEY)." },
        { status: 500 },
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Erro na API da Anthropic: ${err.message}` },
        { status: 500 },
      );
    }
    if (err instanceof ChatTurnLimitError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro inesperado." },
      { status: 500 },
    );
  }
}

async function handleChat(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const history = Array.isArray(body?.messages) ? body.messages : [];

  const messages: Anthropic.MessageParam[] = history
    .filter(
      (m: unknown): m is { role: string; content: string } =>
        !!m &&
        typeof m === "object" &&
        ("role" in m
          ? (m as { role: unknown }).role === "user" ||
            (m as { role: unknown }).role === "assistant"
          : false) &&
        typeof (m as { content: unknown }).content === "string",
    )
    .map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "no messages" }, { status: 400 });
  }

  const reply = await runChat(supabase, user.id, messages);
  return NextResponse.json({ reply });
}
