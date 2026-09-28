import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSpendingByCategory, getSummary, listTransactions } from "@/lib/finance/queries";

const MODEL = "claude-opus-5";

let anthropic: Anthropic | undefined;
function getAnthropicClient(): Anthropic {
  if (!anthropic) anthropic = new Anthropic();
  return anthropic;
}

const tools: Anthropic.Tool[] = [
  {
    name: "get_summary",
    description:
      "Get total income, total expenses and balance for an inclusive date range.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string", description: "Start date, YYYY-MM-DD" },
        to: { type: "string", description: "End date, YYYY-MM-DD" },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "get_spending_by_category",
    description:
      "Get totals grouped by category for a date range, sorted highest to lowest. Use this to answer 'which category did I spend the most on'.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string", description: "Start date, YYYY-MM-DD" },
        to: { type: "string", description: "End date, YYYY-MM-DD" },
        type: { type: "string", enum: ["expense", "income"] },
      },
      required: ["from", "to"],
    },
  },
  {
    name: "list_transactions",
    description:
      "List individual transactions in a date range, optionally filtered by category or type. Returns newest first.",
    input_schema: {
      type: "object",
      properties: {
        from: { type: "string" },
        to: { type: "string" },
        category: { type: "string" },
        type: { type: "string", enum: ["expense", "income"] },
        limit: { type: "integer" },
      },
      required: ["from", "to"],
    },
  },
];

const DateRangeInput = z.object({ from: z.string(), to: z.string() });
const CategoryInput = DateRangeInput.extend({
  type: z.enum(["expense", "income"]).optional(),
});
const ListInput = DateRangeInput.extend({
  category: z.string().optional(),
  type: z.enum(["expense", "income"]).optional(),
  limit: z.number().int().positive().max(200).optional(),
});

async function runTool(
  name: string,
  rawInput: unknown,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  switch (name) {
    case "get_summary": {
      const parsed = DateRangeInput.safeParse(rawInput);
      if (!parsed.success) return JSON.stringify({ error: "invalid input" });
      return JSON.stringify(await getSummary(supabase, parsed.data));
    }
    case "get_spending_by_category": {
      const parsed = CategoryInput.safeParse(rawInput);
      if (!parsed.success) return JSON.stringify({ error: "invalid input" });
      const { type, ...range } = parsed.data;
      return JSON.stringify(
        await getSpendingByCategory(supabase, range, type ?? "expense"),
      );
    }
    case "list_transactions": {
      const parsed = ListInput.safeParse(rawInput);
      if (!parsed.success) return JSON.stringify({ error: "invalid input" });
      return JSON.stringify(await listTransactions(supabase, parsed.data));
    }
    default:
      return JSON.stringify({ error: `unknown tool ${name}` });
  }
}

function systemPrompt(): string {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const weekday = now.toLocaleDateString("pt-BR", { weekday: "long" });

  return `Você é um assistente financeiro pessoal dentro de um app de finanças.
Hoje é ${weekday}, ${today} (formato YYYY-MM-DD). A moeda é sempre Real brasileiro (R$).

Use as ferramentas disponíveis para consultar os dados reais do usuário antes de responder
perguntas sobre gastos, entradas, saldo ou categorias — nunca invente números.
Ao calcular períodos relativos (\"essa semana\", \"esse mês\", \"últimos 7 dias\"), calcule as
datas você mesmo a partir de hoje (semana começa na segunda-feira).
Responda sempre em português do Brasil, de forma direta e breve (1-3 frases), formatando
valores como R$ 1.234,56. Se não houver lançamentos no período, diga isso claramente.`;
}

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
        ("role" in m ? (m as { role: unknown }).role === "user" || (m as { role: unknown }).role === "assistant" : false) &&
        typeof (m as { content: unknown }).content === "string",
    )
    .map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "no messages" }, { status: 400 });
  }

  const MAX_ITERATIONS = 6;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt(),
      tools,
      output_config: { effort: "low" },
      messages,
    });

    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    const toolUseBlocks = response.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (toolUseBlocks.length === 0) {
      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return NextResponse.json({
        reply: text || "Não consegui gerar uma resposta.",
      });
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = await runTool(block.name, block.input, supabase);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  return NextResponse.json(
    { error: "muitas etapas, tente reformular a pergunta" },
    { status: 500 },
  );
}
