const { MessageEmbed } = require('discord.js');
const fs = require('fs').promises; // Use promises API for fs
const path = require('path');
const config = require('../../config.json');

module.exports = {
    name: 'redeem',
    description: 'Redeem a code',
    usage: 'redeem <code>',
    
    async execute(message, args) {
        // Check if the user has the staff role
        if (!config.staffRoleIds.some(roleId => message.member.roles.cache.has(roleId))) {
            return message.channel.send(
                new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Insufficient Permissions!')
                    .setDescription('You do not have the necessary permissions to use this command.')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        }

        const codeToRedeem = args[0];

        // Check if the code parameter is missing
        if (!codeToRedeem) {
            return message.channel.send(
                new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Missing Parameters!')
                    .setDescription('You need to provide a code to redeem.')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        }

        const redeemFilePath = path.join(__dirname, '../../redeemcodes/redeemcodes.txt');

        try {
            // Read the contents of redeemcodes.txt file
            let data = await fs.readFile(redeemFilePath, 'utf8');
            const lines = data.split('\n');

            // Check if the code exists in any line
            const foundLineIndex = lines.findIndex(line => line.startsWith(`${codeToRedeem} - `));

            if (foundLineIndex !== -1) {
                // Extract the content after the code
                const redeemedContent = lines[foundLineIndex].substring(`${codeToRedeem} - `.length);

                // Remove the redeemed line from the array
                lines.splice(foundLineIndex, 1);

                // Join the remaining lines
                data = lines.join('\n');

                // Write the updated content back to redeemcodes.txt
                await fs.writeFile(redeemFilePath, data, 'utf8');

                // Send the success message after deleting the line
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.green)
                        .setTitle('Code Redeemed Successfully')
                        .setDescription(`The code has been redeemed successfully for:\n**${redeemedContent}**`)
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            } else {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Invalid Code')
                        .setDescription('The provided code is invalid.')
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            }
        } catch (error) {
            console.error('Error reading or writing file:', error);
            return message.channel.send(
                new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('An Error Occurred')
                    .setDescription('An error occurred while processing the command.')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        }
    },
};