import { NextResponse, after, type NextRequest } from "next/server";
import { InteractionResponseType, InteractionType, verifyKey } from "discord-interactions";
import { createAdminClient } from "@/lib/supabase/admin";
import { runChat } from "@/lib/chat/runChat";
import { editOriginalInteractionResponse } from "@/lib/discord/rest";

export const maxDuration = 60;

type DiscordOption = { name: string; value?: string | number };
type DiscordInteraction = {
  type: number;
  application_id: string;
  token: string;
  data?: { name: string; options?: DiscordOption[] };
  member?: { user?: { id: string } };
  user?: { id: string };
};

function getOption(options: DiscordOption[] | undefined, name: string): string {
  const value = options?.find((o) => o.name === name)?.value;
  return value === undefined ? "" : String(value);
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const rawBody = await request.text();

  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  if (!publicKey || !signature || !timestamp) {
    return new NextResponse("Bad request signature", { status: 401 });
  }

  const isValid = await verifyKey(rawBody, signature, timestamp, publicKey);
  if (!isValid) {
    return new NextResponse("Bad request signature", { status: 401 });
  }

  const interaction = JSON.parse(rawBody) as DiscordInteraction;

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (interaction.type !== InteractionType.APPLICATION_COMMAND || !interaction.data) {
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Comando não suportado." },
    });
  }

  const discordUserId = interaction.member?.user?.id ?? interaction.user?.id;
  if (!discordUserId) {
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Não consegui identificar seu usuário do Discord." },
    });
  }

  const { name, options } = interaction.data;

  if (name === "vincular") {
    const code = getOption(options, "codigo").trim().toUpperCase();
    const content = await handleLink(discordUserId, code);
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content },
    });
  }

  if (name === "pergunta") {
    const texto = getOption(options, "texto").trim();
    const { application_id, token } = interaction;
    after(async () => {
      const content = await handlePergunta(discordUserId, texto);
      await editOriginalInteractionResponse(application_id, token, content);
    });
    return NextResponse.json({
      type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    });
  }

  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: "Comando desconhecido." },
  });
}

async function handleLink(discordUserId: string, code: string): Promise<string> {
  if (!code) {
    return "Uso: /vincular codigo:XXXXXX — gere o código no site, em Configurações → Discord.";
  }

  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("link_codes")
    .select("code, user_id, expires_at, used_at")
    .eq("code", code)
    .maybeSingle();

  if (!row) return "Código inválido. Gere um novo no site.";
  if (row.used_at) return "Esse código já foi usado. Gere um novo no site.";
  if (new Date(row.expires_at) < new Date()) return "Esse código expirou. Gere um novo no site.";

  const { error: linkError } = await supabase
    .from("discord_links")
    .upsert({ discord_user_id: discordUserId, user_id: row.user_id });
  if (linkError) {
    console.error("discord link upsert failed", linkError);
    return "Erro ao vincular sua conta. Tenta de novo.";
  }

  await supabase.from("link_codes").update({ used_at: new Date().toISOString() }).eq("code", code);

  return "Conta vinculada! Agora você pode usar /pergunta pra conversar sobre suas finanças.";
}

async function handlePergunta(discordUserId: string, texto: string): Promise<string> {
  if (!texto) return "Manda uma pergunta, ou algo tipo 'gastei 45 no Uber hoje'.";

  const supabase = createAdminClient();

  const { data: link } = await supabase
    .from("discord_links")
    .select("user_id")
    .eq("discord_user_id", discordUserId)
    .maybeSingle();

  if (!link) {
    return "Sua conta do Discord ainda não está vinculada. No site, vá em Configurações → Discord, gere um código e rode /vincular codigo:SEUCODIGO aqui.";
  }

  try {
    const reply = await runChat(supabase, link.user_id, [{ role: "user", content: texto }]);
    return reply.length > 1900 ? `${reply.slice(0, 1900)}…` : reply;
  } catch (err) {
    console.error("discord /pergunta error", err);
    return "Deu um erro ao consultar suas finanças. Tenta de novo em instantes.";
  }
}
