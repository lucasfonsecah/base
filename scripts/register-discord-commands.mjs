// One-time setup: registers the bot's global slash commands with Discord.
// Run locally: DISCORD_APPLICATION_ID=... DISCORD_BOT_TOKEN=... npm run discord:register
// Re-run whenever the command list below changes.

const APPLICATION_ID = process.env.DISCORD_APPLICATION_ID;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!APPLICATION_ID || !BOT_TOKEN) {
  console.error(
    "Defina DISCORD_APPLICATION_ID e DISCORD_BOT_TOKEN no ambiente antes de rodar este script.",
  );
  process.exit(1);
}

// integration_types: 0 = instalado no servidor, 1 = instalado no usuário
// contexts: 0 = servidor, 1 = DM com o bot, 2 = outros canais privados
const commands = [
  {
    name: "pergunta",
    description: "Pergunte sobre suas finanças ou registre um gasto/entrada",
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "texto",
        description:
          "Ex: 'qual categoria eu mais gastei essa semana' ou 'gastei 45 no uber'",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "vincular",
    description: "Vincula sua conta do Discord à sua conta do site",
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "codigo",
        description: "O código gerado no site, em Configurações → Discord",
        type: 3,
        required: true,
      },
    ],
  },
];

const res = await fetch(
  `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  },
);

if (!res.ok) {
  console.error(`Falha ao registrar comandos (status ${res.status}):`);
  console.error(await res.text());
  process.exit(1);
}

console.log("Comandos registrados com sucesso:");
console.log(JSON.stringify(await res.json(), null, 2));
