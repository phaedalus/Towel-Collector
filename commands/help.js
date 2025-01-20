const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Displays information about the available commands and how to use them.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#3498db') // Set the embed color
      .setTitle('Towel Collector Bot - Help')
      .setDescription('Need a hand? Get the lowdown on all the commands you can use to track your height and compare it with others!')
      .addFields(
        { name: '/compare-heights', value: 'Compare heights of all members in a server.', inline: true },
        { name: '/compare-visual', value: 'Show a visual for everyones height in the server.', inline: true },
        { name: '/register-height', value: 'Register or update your height in the system.', inline: true },
        { name: '/compare-two', value: 'Compare the heights of two specific users.', inline: true },
        { name: '/height', value: 'Check the height of a user or yourself.', inline: true },
        { name: '/help', value: 'Shows this help message.', inline: true },
        { name: '/stats', value: 'Displays bot statistics including server count, and average response time.', inline: true }
      )
      .setFooter({ text: 'Towel Collector Bot | Your personal height tracking bot!' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};