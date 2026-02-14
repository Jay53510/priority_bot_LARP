require('dotenv').config();

const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { PREFIX } = require('./src/constants');
const { createSystemEmbed, createErrorEmbed } = require('./src/embedFactory');
const {
  startPriority,
  endPriority,
  getStatus,
  formatDuration
} = require('./src/priorityManager');

if (!process.env.DISCORD_TOKEN) {
  console.error('Missing DISCORD_TOKEN in environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

async function sendEmbed(channel, embed) {
  await channel.send({ embeds: [embed] });
}

async function handleStartPriority(message) {
  const result = startPriority(async () => {
    try {
      const expiredEmbed = createSystemEmbed({
        title: '⏰ Priority Expired',
        description: 'The 40-minute limit has been reached. Cooldown has started.',
        color: 0xffa500
      });
      await sendEmbed(message.channel, expiredEmbed);
    } catch (error) {
      console.error('Failed to send automatic expiry embed:', error);
    }
  });

  if (!result.ok) {
    if (result.reason === 'already_active') {
      await message.reply({
        embeds: [createErrorEmbed('A priority is already active.')]
      });
      return;
    }

    if (result.reason === 'cooldown_active') {
      await message.reply({
        embeds: [createErrorEmbed(`Cooldown active. Try again in ${formatDuration(result.remainingMs)}.`)]
      });
      return;
    }
  }

  const startedEmbed = createSystemEmbed({
    title: '🚨 Priority Started',
    description: 'A priority has been started. You have 40 minutes to complete it.',
    color: 0xff0000
  });

  await sendEmbed(message.channel, startedEmbed);
}

async function handleEndPriority(message) {
  const result = endPriority();

  if (!result.ok) {
    await message.reply({
      embeds: [createErrorEmbed('There is no active priority.')]
    });
    return;
  }

  const endedEmbed = createSystemEmbed({
    title: '✅ Priority Ended',
    description: 'The priority has ended. A 20-minute cooldown has started.',
    color: 0x57f287
  });

  await sendEmbed(message.channel, endedEmbed);
}

async function handlePriorityStatus(message) {
  const status = getStatus();

  const statusEmbed = createSystemEmbed({
    title: '📊 Priority Status',
    description: [
      `**Active Priority:** ${status.isActive ? 'Yes' : 'No'}`,
      `**Time Remaining:** ${status.remainingPriorityText}`,
      `**Cooldown Remaining:** ${status.cooldownRemainingText}`
    ].join('\n'),
    color: 0x0099ff
  });

  await sendEmbed(message.channel, statusEmbed);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.author.bot || !message.guild) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = (args[0] || '').toLowerCase();

    switch (command) {
      case 'startpriority':
        await handleStartPriority(message);
        break;
      case 'endpriority':
        await handleEndPriority(message);
        break;
      case 'prioritystatus':
        await handlePriorityStatus(message);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Command handling error:', error);
    if (message?.channel) {
      await message.channel.send({
        embeds: [createErrorEmbed('An unexpected error occurred while running that command.')]
      });
    }
  }
});

client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

client.login(process.env.DISCORD_TOKEN).catch((error) => {
  console.error('Failed to login to Discord:', error);
  process.exit(1);
});
