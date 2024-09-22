const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'nuke',
    description: 'Delete all messages in the channel.',
    usage: 'nuke',
    execute: async (message, args, usedPrefix) => {
        // Check if the user has the necessary role
        if (!message.member.roles.cache.some(role => config.nukeroleids.includes(role.id))) {
            return message.reply('You do not have the necessary permissions to use this command.');
        }

        try {
            // Fetch messages in the channel
            const messages = await message.channel.messages.fetch({ limit: 100 }); // Fetch up to 100 messages

            // Delete messages and handle bulk delete limit
            if (messages.size > 0) {
                await message.channel.bulkDelete(messages, true); // The 'true' argument removes messages older than 14 days
            }

            // Announce the channel nuke with the user who initiated it
            const nukeEmbed = new MessageEmbed()
                .setColor('#ff0000')
                .setDescription(`🚨 Channel nuked by ${message.author}! 💥`);
            await message.channel.send(nukeEmbed);

        } catch (error) {
            console.error('Error nuking channel:', error);

            // Handle specific errors
            if (error.code === 10003) {
                return message.reply('Unable to find the channel. Please make sure the channel exists and try again.');
            } else {
                return message.reply('An error occurred while deleting messages.');
            }
        }
    },
};