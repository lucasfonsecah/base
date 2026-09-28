# Minhas Finanças

App pessoal de controle financeiro: registre gastos e entradas, acompanhe um
painel com resumo e gráficos, e converse com um assistente (Claude) que
consulta seus dados reais para responder perguntas como *"qual categoria eu
mais gastei essa semana?"*.

Stack: Next.js (App Router) + Supabase (Postgres/Auth) + Anthropic API.

## 1. Criar o projeto no Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com) (o
   plano gratuito é suficiente).
2. Em **SQL Editor**, cole e rode, nessa ordem, o conteúdo de
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) e
   [`supabase/migrations/0002_discord_links.sql`](./supabase/migrations/0002_discord_links.sql).
   Isso cria a tabela `transactions` (com Row Level Security, garantindo que
   cada usuário só enxerga os próprios lançamentos) e as tabelas usadas pra
   vincular uma conta ao bot do Discord.
3. Em **Settings → API**, copie a **Project URL** e a chave **anon public**
   (aba "API Keys"). Se for configurar o bot do Discord, copie também a
   **Secret key** — ela vira `SUPABASE_SERVICE_ROLE_KEY` (só usada no
   servidor, nunca no navegador).
4. (Opcional, recomendado em dev) Em **Authentication → Providers → Email**,
   desative "Confirm email" para poder testar login sem precisar clicar num
   link de confirmação a cada cadastro.

## 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
```

| Variável | Onde conseguir |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` em dev, sua URL pública em produção |
| `ANTHROPIC_API_KEY` | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys → Secret keys (só pro bot do Discord) |
| `DISCORD_PUBLIC_KEY`, `DISCORD_BOT_TOKEN`, `DISCORD_APPLICATION_ID` | veja a seção "Bot do Discord" abaixo (opcional) |

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Crie uma conta (aba
"Criar conta" na tela de login) e comece a registrar lançamentos.

## 4. Deploy

O jeito mais simples é a [Vercel](https://vercel.com/new): importe o
repositório, adicione as mesmas variáveis de ambiente do passo 2 (trocando
`NEXT_PUBLIC_SITE_URL` pela URL final do deploy) e publique. Depois, em
Supabase → **Authentication → URL Configuration**, adicione essa URL em
"Redirect URLs" para o link de confirmação de e-mail funcionar.

## 5. Bot do Discord (opcional)

Deixa você usar o mesmo assistente (perguntar, pedir relatório, registrar
gastos) direto do Discord, via comandos `/`. Roda no mesmo projeto da Vercel,
sem servidor extra.

1. Vá em [discord.com/developers/applications](https://discord.com/developers/applications)
   → **New Application**, dê um nome.
2. Na aba **General Information**: copie o **Application ID**
   (`DISCORD_APPLICATION_ID`) e a **Public Key** (`DISCORD_PUBLIC_KEY`).
3. Na aba **Bot**: clique em **Reset Token** e copie o token
   (`DISCORD_BOT_TOKEN`) — só aparece uma vez.
4. Adicione as 4 variáveis (`DISCORD_PUBLIC_KEY`, `DISCORD_BOT_TOKEN`,
   `DISCORD_APPLICATION_ID`, `SUPABASE_SERVICE_ROLE_KEY`) no ambiente da
   Vercel (Settings → Environment Variables) e faça o deploy.
5. Registre os comandos (`/pergunta` e `/vincular`) — rode uma vez, localmente:
   ```bash
   DISCORD_APPLICATION_ID=... DISCORD_BOT_TOKEN=... npm run discord:register
   ```
6. De volta na aba **General Information** do app no Discord, preencha
   **Interactions Endpoint URL** com:
   ```
   https://SEU-DOMINIO.vercel.app/api/discord/interactions
   ```
   O Discord testa esse endereço na hora — se o deploy já tiver as variáveis
   configuradas, ele valida sozinho.
7. Na aba **Installation**, garanta que o "Install Link" inclua o escopo
   `applications.commands` e (se quiser usar em servidor) `bot`. Use o link
   gerado ali pra adicionar o bot a um servidor, ou instale só pra você
   (User Install) pra usar só em DM.
8. No site, vá em **Discord** (menu do painel), clique em **Gerar código**, e
   no Discord rode `/vincular codigo:XXXXXX` com o código gerado.
9. Pronto — `/pergunta texto:qual categoria eu mais gastei essa semana`.

## Como funciona

- **Lançamentos**: cada gasto/entrada é uma linha na tabela `transactions`
  (`type`, `amount`, `category`, `occurred_on`, `description`), protegida por
  RLS — o Postgres só libera as linhas do próprio usuário autenticado.
- **Painel** (`/dashboard`): resumo do mês (entradas, gastos, saldo), gráfico
  de gastos por categoria na semana e evolução do saldo diário nos últimos 30
  dias.
- **Lançamentos** (`/dashboard/transactions`): histórico completo, navegável
  por mês, com opção de excluir.
- **Chat** (`/dashboard/chat` e Discord): a cada pergunta, o backend chama a
  API da Anthropic com *tool use* — o modelo decide quais ferramentas chamar
  (resumo do período, gastos por categoria, listar lançamentos, **registrar**
  um novo gasto/entrada), essas ferramentas consultam/gravam no Supabase com
  os mesmos dados que você vê no painel, e a resposta final é gerada a partir
  do resultado real, nunca inventado. Web e Discord chamam a mesma lógica
  (`src/lib/chat/runChat.ts`).
- **Discord** (`/dashboard/discord` + `/api/discord/interactions`): comandos
  `/pergunta` (mesmo assistente do chat web) e `/vincular` (liga sua conta do
  Discord à sua conta do site via um código de uso único). Roda como uma
  rota HTTP normal na Vercel — sem processo separado — usando o modelo de
  "Interactions Endpoint" do Discord.

## Estrutura

```
src/
  lib/supabase/          clientes Supabase (browser, server, middleware, admin/service-role)
  lib/finance/            tipos, categorias padrão, consultas ao banco
  lib/chat/runChat.ts      motor do assistente (ferramentas + loop), usado pelo chat web e pelo Discord
  lib/discord/             verificação de assinatura e chamadas à API REST do Discord
  proxy.ts                 mantém a sessão viva e protege rotas autenticadas
  app/login/               login e cadastro
  app/auth/callback/       troca o código de confirmação por sessão
  app/dashboard/            painel, formulário de lançamento, gráficos, chat, vínculo com Discord
  app/api/chat/             endpoint do assistente pro chat web
  app/api/discord/interactions/  endpoint dos comandos do Discord
scripts/register-discord-commands.mjs  registra /pergunta e /vincular no Discord (rodar 1x)
supabase/migrations/      schema SQL (rode manualmente no SQL Editor, em ordem)
```
