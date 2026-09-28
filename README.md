# Minhas Finanças

App pessoal de controle financeiro: registre gastos e entradas, acompanhe um
painel com resumo e gráficos, e converse com um assistente (Claude) que
consulta seus dados reais para responder perguntas como *"qual categoria eu
mais gastei essa semana?"*.

Stack: Next.js (App Router) + Supabase (Postgres/Auth) + Anthropic API.

## 1. Criar o projeto no Supabase

1. Crie uma conta e um projeto em [supabase.com](https://supabase.com) (o
   plano gratuito é suficiente).
2. Em **SQL Editor**, cole e rode o conteúdo de
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   Isso cria a tabela `transactions` com Row Level Security, garantindo que
   cada usuário só enxerga os próprios lançamentos.
3. Em **Settings → API**, copie a **Project URL** e a chave **anon public**.
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

## Como funciona

- **Lançamentos**: cada gasto/entrada é uma linha na tabela `transactions`
  (`type`, `amount`, `category`, `occurred_on`, `description`), protegida por
  RLS — o Postgres só libera as linhas do próprio usuário autenticado.
- **Painel** (`/dashboard`): resumo do mês (entradas, gastos, saldo), gráfico
  de gastos por categoria na semana e evolução do saldo diário nos últimos 30
  dias.
- **Lançamentos** (`/dashboard/transactions`): histórico completo, navegável
  por mês, com opção de excluir.
- **Chat** (`/dashboard/chat`): a cada pergunta, o backend chama a API da
  Anthropic com *tool use* — o modelo decide quais ferramentas chamar
  (resumo do período, gastos por categoria, listar lançamentos), essas
  ferramentas consultam o Supabase com os mesmos dados que você vê no
  painel, e a resposta final é gerada a partir do resultado real, nunca
  inventado.

## Estrutura

```
src/
  lib/supabase/       cliente Supabase (browser, server, middleware)
  lib/finance/         tipos, categorias padrão, consultas ao banco
  middleware.ts         mantém a sessão viva e protege rotas autenticadas
  app/login/            login e cadastro
  app/auth/callback/    troca o código de confirmação por sessão
  app/dashboard/         painel, formulário de lançamento, gráficos, chat
  app/api/chat/          endpoint do assistente (tool use com a Anthropic API)
supabase/migrations/    schema SQL (rode manualmente no SQL Editor)
```
