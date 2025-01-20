const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas'); // Import Canvas library

function convertHeightToFeetAndInches(cm) {
    const totalInches = Math.round(cm / 2.54); // Convert cm to inches
    const feet = Math.floor(totalInches / 12); // Extract feet
    const inches = totalInches % 12; // Remaining inches
    return `${feet}'${inches}"`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compare-two')
        .setDescription('Compare the heights of two users.')
        .addUserOption(option =>
            option.setName('user1')
                .setDescription('First user to compare')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user2')
                .setDescription('Second user to compare')
                .setRequired(true)),

    async execute(interaction) {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2');

        // Retrieve the server's height data
        const serverId = interaction.guild.id;
        const serverDataPath = path.join(__dirname, '..', 'servers', `${serverId}.json`);

        if (!fs.existsSync(serverDataPath)) {
            return interaction.reply({ content: 'No height data available for this server.', ephemeral: true });
        }

        const serverData = JSON.parse(fs.readFileSync(serverDataPath, 'utf-8'));
        

        // Check if both users have height data
        const predefinedHeight = 304.8; // 10 feet in cm
        const user1Data = user1.id === interaction.client.user.id 
            ? { username: interaction.client.user.username, height: predefinedHeight } 
            : serverData[user1.id];

        const user2Data = user2.id === interaction.client.user.id 
            ? { username: interaction.client.user.username, height: predefinedHeight } 
            : serverData[user2.id];

        if (!user1Data || !user2Data) {
            return interaction.reply({ content: 'One or both of the selected users have not registered their height yet.', ephemeral: true });
        }


        // Both users have height data, proceed with comparison
        const height1 = user1Data.height;
        const height2 = user2Data.height;

        // Generate a visual for the height comparison
        const canvas = createCanvas(500, 300);
        const ctx = canvas.getContext('2d');

        // Draw a simple bar chart comparing the heights
        const maxHeight = Math.max(height1, height2);
        const scaleFactor = 200 / maxHeight; // Scale the heights for the canvas

        ctx.fillStyle = '#3498db';
        ctx.fillRect(50, 250 - height1 * scaleFactor, 100, height1 * scaleFactor); // User 1
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(250, 250 - height2 * scaleFactor, 100, height2 * scaleFactor); // User 2

        // Add labels to the bars
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText(`${user1.username}`, 50, 270);
        ctx.fillText(`${user2.username}`, 250, 270);

        // Generate image from the canvas
        const imageBuffer = canvas.toBuffer();

        // Create the embed with the image
        const comparisonEmbed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('Height Comparison')
            .setDescription(`${user1.username} vs. ${user2.username}`)
            .setImage('attachment://height_comparison.png')
            .addFields(
                { name: `${user1.username}'s Height`, value: `${height1} cm (${convertHeightToFeetAndInches(height1)})`, inline: true },
                { name: `${user2.username}'s Height`, value: `${height2} cm (${convertHeightToFeetAndInches(height2)})`, inline: true }
            );

        // Send the embed with the image as an attachment
        return interaction.reply({
            embeds: [comparisonEmbed],
            files: [{
                attachment: imageBuffer,
                name: 'height_comparison.png'
            }]
        });
    },
};