const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { createCanvas } = require('canvas');

module.exports = {
    data: {
        name: 'compare-visual',
        description: 'Visualize the heights of all registered users in this server.',
    },
    async execute(interaction) {
        const serverId = interaction.guildId;
        const filePath = path.resolve(__dirname, '../servers', `${serverId}.json`);

        if (!fs.existsSync(filePath)) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('No Data Found')
                .setDescription('No height data has been registered for this server yet.\nUse `/register-height` to add your height!');

            return interaction.reply({ embeds: [errorEmbed] });
        }

        const serverData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const users = Object.values(serverData);

        if (users.length === 0) {
            const noDataEmbed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('No Registered Heights')
                .setDescription('No users have registered their height in this server yet.');

            return interaction.reply({ embeds: [noDataEmbed] });
        }

        const sortedUsers = [...users].sort((a, b) => b.height - a.height);
        const maxHeight = sortedUsers[0].height;

        const canvasWidth = 800;
        const canvasHeight = 600;
        const canvas = createCanvas(canvasWidth, canvasHeight);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#2c2f33';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Height Comparison (Visual)', canvasWidth / 2, 50);

        const maxBars = 10;
        const visibleUsers = Math.min(users.length, maxBars);
        const barWidth = 40;
        const barSpacing = Math.min(30, (canvasWidth - 200) / visibleUsers - barWidth);
        const chartHeight = canvasHeight - 150;
        const chartTop = 100;
        const chartLeft = 100;

        sortedUsers.slice(0, maxBars).forEach((user, index) => {
            const barHeight = Math.round((user.height / maxHeight) * chartHeight);
            const barX = chartLeft + index * (barWidth + barSpacing);
            const barY = chartHeight - barHeight + chartTop;

            ctx.fillStyle = '#3498db';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = '#ffffff';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 5;
            
            ctx.save();
            
            ctx.translate(barX + barWidth / 2, barY + barHeight / 2);
            ctx.rotate(-Math.PI / 2);

            ctx.fillText(user.username, 0, 0);

            ctx.restore();

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 5;
            ctx.fillText(`${user.height} cm`, barX + barWidth / 2, barY - 10);
        });

        const imageBuffer = canvas.toBuffer();

        const visualEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('Height Comparison (Visual)')
            .setDescription(`Here is the height comparison for the top ${visibleUsers} registered users.`)
            .setImage('attachment://height_comparison.png')
            .setFooter({ text: `Total Users: ${users.length}` })
            .setTimestamp();

        await interaction.reply({
            embeds: [visualEmbed],
            files: [{ attachment: imageBuffer, name: 'height_comparison.png' }]
        });
    },
};