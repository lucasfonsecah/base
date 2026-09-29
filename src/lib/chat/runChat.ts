import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  getSpendingByCategory,
  getSummary,
  insertTransaction,
  listTransactions,
} from "@/lib/finance/queries";

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
  {
    name: "add_transaction",
    description:
      "Register a new expense or income for the user. Use this whenever they report spending, paying, buying, receiving or earning money (e.g. 'gastei 50 no mercado', 'recebi 200 de freelance', or a pasted bank/SMS notification). Infer a sensible category and the date (default to today) instead of asking, unless the amount itself is missing or truly ambiguous.",
    input_schema: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["expense", "income"] },
        amount: { type: "number", description: "Positive amount in BRL" },
        category: {
          type: "string",
          description:
            "e.g. Alimentação, Transporte, Moradia, Lazer, Saúde, Educação, Compras, Salário, Freelance, Investimentos, Outros",
        },
        description: { type: "string" },
        occurred_on: { type: "string", description: "YYYY-MM-DD, default to today" },
      },
      required: ["type", "amount", "category", "occurred_on"],
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
const NewTransactionInput = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  category: z.string().trim().min(1),
  description: z.string().trim().optional(),
  occurred_on: z.string().min(1),
});

async function runTool(
  name: string,
  rawInput: unknown,
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  switch (name) {
    case "get_summary": {
      const parsed = DateRangeInput.safeParse(rawInput);
      if (!parsed.success) return JSON.stringify({ error: "invalid input" });
      return JSON.stringify(await getSummary(supabase, userId, parsed.data));
    }
    case "get_spending_by_category": {
      const parsed = CategoryInput.safeParse(rawInput);
      if (!parsed.success) return JSON.stringify({ error: "invalid input" });
      const { type, ...range } = parsed.data;
      return JSON.stringify(
        await getSpendingByCategory(supabase, userId, range, type ?? "expense"),
      );
    }
    case "list_transactions": {
      const parsed = ListInput.safeParse(rawInput);
      if (!parsed.success) return JSON.stringify({ error: "invalid input" });
      return JSON.stringify(await listTransactions(supabase, userId, parsed.data));
    }
    case "add_transaction": {
      const parsed = NewTransactionInput.safeParse(rawInput);
      if (!parsed.success) return JSON.stringify({ error: "invalid input" });
      const transaction = await insertTransaction(supabase, userId, parsed.data);
      return JSON.stringify({ ok: true, transaction });
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

Você também pode REGISTRAR lançamentos com a ferramenta add_transaction. Use sempre que o
usuário disser que gastou, pagou, comprou, recebeu ou ganhou algo, ou colar o texto de um
SMS/notificação de banco. Infira categoria e data (padrão hoje) em vez de perguntar, a não
ser que o valor esteja realmente ausente ou ambíguo. Depois de registrar, confirme com um
resumo curto (valor, categoria, data).

Responda sempre em português do Brasil. Para perguntas simples (um número, uma categoria),
seja direto e breve (1-3 frases). Se o usuário pedir um relatório, resumo completo ou plano
de ação para economizar, pode ser mais longo e estruturado (use tópicos e traga números
concretos das ferramentas). Formate valores como R$ 1.234,56. Se não houver lançamentos no
período, diga isso claramente.`;
}

export class ChatTurnLimitError extends Error {}

/**
 * Runs one full tool-use turn against the finance data for `userId` and
 * returns the assistant's final text reply. `supabase` may be a
 * cookie-scoped client (RLS-enforced, web chat) or a service-role client
 * (Discord bot, no session) — every query function filters by `userId`
 * explicitly either way.
 */
export async function runChat(
  supabase: SupabaseClient,
  userId: string,
  messages: Anthropic.MessageParam[],
): Promise<string> {
  const MAX_ITERATIONS = 6;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await getAnthropicClient().messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt(),
      tools,
      output_config: { effort: "medium" },
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
      return text || "Não consegui gerar uma resposta.";
    }

    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of toolUseBlocks) {
      const result = await runTool(block.name, block.input, supabase, userId);
      toolResults.push({
        type: "tool_result",
        tool_use_id: block.id,
        content: result,
      });
    }
    messages.push({ role: "user", content: toolResults });
  }

  throw new ChatTurnLimitError("muitas etapas, tente reformular a pergunta");
}
