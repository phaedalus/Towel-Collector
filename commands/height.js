const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function cmToFeetInches(cm) {
  const inches = cm / 2.54;
  const feet = Math.floor(inches / 12);
  const remainingInches = Math.round(inches % 12);
  return `${feet}'${remainingInches}"`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('height')
    .setDescription('Check the height of a user or yourself.')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user whose height you want to check.')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const serverId = interaction.guild.id;
    const serversPath = './servers';
    const serverFile = path.join(serversPath, `${serverId}.json`);

    if (!fs.existsSync(serversPath)) {
      fs.mkdirSync(serversPath);
    }

    if (!fs.existsSync(serverFile)) {
      fs.writeFileSync(serverFile, JSON.stringify({}, null, 2));
    }

    const serverData = JSON.parse(fs.readFileSync(serverFile, 'utf8'));

    const userData = serverData[user.id];
    if (!userData) {
      return interaction.reply({
        content: `${user.username} has not registered their height yet! Use /register-height to set it up.`,
        flags: 64
      });
    }

    const heightInFeetInches = cmToFeetInches(userData.height);

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(`${user.username}'s Height`)
      .setDescription(`Here’s ${user.username}'s recorded height:`)
      .addFields(
        { name: 'Height:', value: `${heightInFeetInches} (${userData.height} cm)`, inline: true }
      )
      .setFooter({ text: 'Towel Collector Bot | Height Tracker' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};