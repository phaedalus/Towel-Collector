const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    client.user.setPresence({
        activities: [
            {
                name: `${client.guilds.cache.size} servers`,
                type: ActivityType.Watching,
            }
        ],
        status: "idle",
    });

    setInterval(() => {
        client.user.setPresence({
            activities: [
                {
                    name: `${client.guilds.cache.size} servers`,
                    type: ActivityType.Watching,
                }
            ],
            status: "idle",
        });
    }, 30000);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing that command!', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);