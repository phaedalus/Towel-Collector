const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const statsFilePath = path.resolve(__dirname, '../stats.json');

function loadStats() {
    if (!fs.existsSync(statsFilePath)) {
        return {
            serverCount: 0,
            totalResponseTime: 0,
            totalResponses: 0
        };
    }
    
    try {
        const data = fs.readFileSync(statsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading or parsing stats file:', error);
        return {
            serverCount: 0,
            totalResponseTime: 0,
            totalResponses: 0
        };
    }
}

function saveStats(stats) {
    try {
        if (stats && typeof stats === 'object' && stats.serverCount !== undefined) {
            const statsJson = JSON.stringify(stats, null, 2);
            if (statsJson) {
                fs.writeFileSync(statsFilePath, statsJson, 'utf-8');
            } else {
                console.error('Failed to serialize stats:', stats);
            }
        } else {
            console.error('Invalid stats data:', stats);
        }
    } catch (error) {
        console.error('Error saving stats file:', error);
    }
}

module.exports = {
    data: {
        name: 'stats',
        description: 'Displays bot statistics including server count, and average response time.',
    },
    async execute(interaction) {
        const startTime = Date.now();

        const stats = loadStats();

        stats.serverCount = interaction.client.guilds.cache.size;

        const responseTime = Date.now() - startTime;
        stats.totalResponseTime += responseTime;
        stats.totalResponses += 1;

        const averageResponseTime = stats.totalResponses === 0 ? 0 : stats.totalResponseTime / stats.totalResponses;

        saveStats(stats);

        const statsEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Towel Collector Statistics')
            .addFields(
                { name: 'Server Count', value: `${stats.serverCount}`, inline: true },
                { name: 'Average Response Time', value: `${averageResponseTime.toFixed(2)} ms`, inline: true }
            )
            .setFooter({ text: 'Bot Stats' })
            .setTimestamp();

        await interaction.reply({ embeds: [statsEmbed] });
    },
};