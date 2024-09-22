const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
    name: 'inactive',
    description: 'Request to be marked as inactive.',
    usage: '.inactive [reason] [time in days]',

    async execute(message, args) {
        const { staffRoleIds, inactiveChannelId, inactiveAcceptRoleId } = config;

        // Check if the message was sent in the correct channel
        if (message.channel.id !== inactiveChannelId) {
            return message.reply('This command can only be used in the designated inactive channel.');
        }

        // Check if the user has one of the allowed staff roles
        const hasPermission = message.member.roles.cache.some(role => staffRoleIds.includes(role.id));
        if (!hasPermission) {
            return message.reply('You do not have permission to use this command.');
        }

        // Parse the reason and time from the args
        const reason = args.slice(0, args.length - 1).join(' ');
        const time = parseInt(args[args.length - 1], 10);

        if (!reason || isNaN(time) || time <= 0) {
            return message.reply('Please provide a valid reason and time in days.');
        }

        const inactiveAcceptRole = message.guild.roles.cache.get(inactiveAcceptRoleId);
        const tickEmoji = '✅'; // Corrected tick emoji
        const crossEmoji = '❌'; // Corrected cross emoji

        const inactiveEmbed = new MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Inactive Request')
            .setDescription(`**Author:** ${message.author.tag}\n**Reason:** ${reason}\n**Time:** ${time} days`)
            .setFooter('React to accept or decline the request.')
            .setTimestamp();

        try {
            const requestMessage = await message.channel.send(`${inactiveAcceptRole}`, inactiveEmbed);
            await requestMessage.react(tickEmoji);
            await requestMessage.react(crossEmoji);

            // Filter to ensure only roles 5-8 can react
            const filter = (reaction, user) => {
                return [tickEmoji, crossEmoji].includes(reaction.emoji.name) &&
                    message.guild.members.cache.get(user.id).roles.cache.some(role => staffRoleIds.slice(4, 8).includes(role.id));
            };

            const collector = requestMessage.createReactionCollector(filter, { max: 1 });

            collector.on('collect', (reaction) => {
                if (reaction.emoji.name === tickEmoji) {
                    // Accept request: delete the original message and send a confirmation
                    requestMessage.delete();

                    const acceptedEmbed = new MessageEmbed()
                        .setColor('#00FF00')
                        .setTitle('Inactive Request Accepted')
                        .setDescription(`**Author:** ${message.author.tag}\n**Reason:** ${reason}\n**Time:** ${time} days`)
                        .setTimestamp();

                    message.channel.send(`${message.author}`, acceptedEmbed);

                    // Add to inactive list in the main directory
                    const inactiveRecord = `Name: ${message.author.tag}, Reason: ${reason}, Time: ${time} days\n`;
                    const filePath = path.join(__dirname, '../../inactive_list.txt');
                    try {
                        fs.appendFileSync(filePath, inactiveRecord);
                    } catch (error) {
                        console.error('Error writing to inactive list file:', error);
                    }

                } else if (reaction.emoji.name === crossEmoji) {
                    // Decline request: delete the original message and send a decline message
                    requestMessage.delete();

                    message.channel.send(`Inactive request declined, ${message.author}`);
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    requestMessage.reactions.removeAll().catch(error => console.error('Failed to clear reactions:', error));
                }
            });
        } catch (error) {
            console.error('Error sending the inactive request message:', error);
            message.reply('There was an error trying to process your request. Please try again later.');
        }
    },
};