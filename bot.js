// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require("discord.js");
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  await require("./btnInteraction/mining").sendInitialMsg(readyClient);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  await require("./commands/coinflip")(message);
  await require("./commands/pointCommand")(message);
  await require("./commands/conch")(message);
  await require("./commands/russianRoulette").create(message);
});

// button interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  await require("./commands/russianRoulette").buttonInteraction(interaction);
  await require("./btnInteraction/mining").start(interaction);
  await require("./btnInteraction/mining").buttonInteraction(interaction);
});

// Log in to Discord with your client's token
client.login(token);
