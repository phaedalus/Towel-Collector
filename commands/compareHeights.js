const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'compare-heights',
        description: 'Compare the heights of all registered users in this server.',
    },
    async execute(interaction) {
        const serverId = interaction.guildId;
        const filePath = path.resolve(__dirname, '../servers', `${serverId}.json`);

        // Check if height data exists for the server
        if (!fs.existsSync(filePath)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('No Data Found')
                .setDescription('No height data has been registered for this server yet.\nUse `/register-height` to add your height!');

            return interaction.reply({ embeds: [errorEmbed] });
        }

        // Load server height data
        const serverData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const users = Object.values(serverData);

        if (users.length === 0) {
            const noDataEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('No Registered Heights')
                .setDescription('No users have registered their height in this server yet.');

            return interaction.reply({ embeds: [noDataEmbed] });
        }

        // Sort users by height
        const sortedUsers = [...users].sort((a, b) => b.height - a.height);
        const tallest = sortedUsers[0];
        const shortest = sortedUsers[sortedUsers.length - 1];

        // Prepare user data fields
        const userFields = sortedUsers.map(user => ({
            name: user.username,
            value: `${user.height} cm`,
            inline: true,
        }));

        // Create embed
        const heightEmbed = new EmbedBuilder()
            .setColor(0x00FFFF)
            .setTitle('Height Comparison')
            .setDescription('Here is the height comparison for all registered users in this server:')
            .addFields(userFields)
            .addFields(
                { name: 'Tallest User', value: `${tallest.username} (${tallest.height} cm)`, inline: false },
                { name: 'Shortest User', value: `${shortest.username} (${shortest.height} cm)`, inline: false }
            )
            .setFooter({ text: `Total Users: ${users.length}` })
            .setTimestamp();

        await interaction.reply({ embeds: [heightEmbed] });
    },
};