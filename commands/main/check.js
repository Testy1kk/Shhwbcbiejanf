const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'check',
  description: 'Check if a user is verified',
  usage: 'check <@user>',
  async execute(message, args, usedPrefix) {
    const targetUser = message.mentions.users.first();

    if (!targetUser) {
      return message.reply('Please mention a user.');
    }

    const logsChannelId = config.logsChannelId;

    try {
      const logsChannel = await message.guild.channels.fetch(logsChannelId);
      if (!logsChannel) {
        return message.reply('Logs channel not found. Please check the logsChannelId in your config.json.');
      }

      // Fetch the messages from the logs channel
      const fetchedMessages = await logsChannel.messages.fetch({ limit: 100 });

      let isVerified = false;

      for (const [id, msg] of fetchedMessages) {
        // Check if the message is from a webhook and contains the target user's username
        if (msg.webhookId && msg.content.includes(targetUser.username)) {
          isVerified = true;
          await msg.delete(); // Delete the message if the user is verified
          break;
        }
      }

      const embed = new MessageEmbed()
        .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL({ dynamic: true }));

      if (isVerified) {
        embed.setColor('#00ff00') // Green color for verified
          .setTitle('VERIFIED')
          .setDescription(`The user ${targetUser} is verified to redeem codes.`);
      } else {
        embed.setColor('#ff0000') // Red color for not verified
          .setTitle('NOT VERIFIED')
          .setDescription(`The user ${targetUser} is not verified to redeem codes.`);
      }

      message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error('Error checking verification status:', error);
      message.reply('There was an error checking the verification status.');
    }
  },
};
