const { EmbedBuilder } = require('discord.js');
const { FOOTER_TEXT } = require('./constants');

function createSystemEmbed({ title, description, color }) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({ text: FOOTER_TEXT })
    .setTimestamp();
}

function createErrorEmbed(description) {
  return createSystemEmbed({
    title: '❌ Priority System',
    description,
    color: 0xed4245
  });
}

module.exports = {
  createSystemEmbed,
  createErrorEmbed
};
