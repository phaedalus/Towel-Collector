const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'register-height',
        description: 'Register your height (e.g., 170cm or 5\'3").',
        options: [
            {
                name: 'height',
                type: 3, // String type
                description: 'Your height in centimeters or feet/inches (e.g., 170cm or 5\'3").',
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const heightInput = interaction.options.getString('height');
        const serverId = interaction.guildId;
        const userId = interaction.user.id;
        const filePath = path.resolve(__dirname, '../servers', `${serverId}.json`);

        // Convert height to centimeters
        let heightInCm;
        const cmMatch = heightInput.match(/^(\d+)\s*cm$/i); // e.g., "170cm"
        const ftInMatch = heightInput.match(/^(\d+)'\s*(\d+)"?$/); // e.g., "5'3" or 5' 3"

        if (cmMatch) {
            heightInCm = parseInt(cmMatch[1], 10);
        } else if (ftInMatch) {
            const feet = parseInt(ftInMatch[1], 10);
            const inches = parseInt(ftInMatch[2], 10);
            heightInCm = Math.round((feet * 30.48) + (inches * 2.54));
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Invalid Height Format')
                .setDescription('Please use one of the following formats:\n- `170cm`\n- `5\'3"`');

            return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }

        // Load or create the server's data file
        let serverData = {};
        if (fs.existsSync(filePath)) {
            serverData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }

        // Register the user's height
        serverData[userId] = {
            username: interaction.user.username,
            height: heightInCm,
        };

        fs.writeFileSync(filePath, JSON.stringify(serverData, null, 2));

        const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Height Registered')
            .setDescription(`Successfully registered your height as **${heightInCm} cm**!`)
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [successEmbed] });
    },
};