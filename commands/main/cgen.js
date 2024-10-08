const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const config = require('../../config.json');

const cgenChannel = config.cgenChannel; // Add your cgenChannel ID in the config.json file
const generated = new Set();

module.exports = {
    name: 'cgen',
    description: 'Generate a specified service if stocked (cookies)',
    usage: 'cgen <service>',

    execute(message, args, usedPrefix) {
        // Check if the cgenChannel is valid
        try {
            message.client.channels.cache.get(cgenChannel).id;
        } catch (error) {
            console.error(error);

            if (config.command.error_message === true) {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Error occurred!')
                        .setDescription('Not a valid cgen channel specified!')
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            } else {
                return;
            }
        }

        // Check if the command is used in the correct channel
        if (message.channel.id !== cgenChannel) {
            return message.channel.send(
                new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Wrong command usage!')
                    .setDescription(`You cannot use the \`cgen\` command in this channel! Try it in <#${cgenChannel}>!`)
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        }

        const service = args[0];

        if (!service) {
            return message.channel.send(
                new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Missing parameters!')
                    .setDescription('You need to specify a service name!')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        }

        const filePath = `${__dirname}/../../cookies/${service}.txt`;

        fs.readFile(filePath, (error, data) => {
            if (!error) {
                data = data.toString();

                const position = data.indexOf('\n');
                const firstLine = data.split('\n')[0];

                if (position === -1 || !firstLine) {
                    return message.channel.send(
                        new MessageEmbed()
                            .setColor(config.color.red)
                            .setTitle('Generator error!')
                            .setDescription(`I couldn't find the \`${service}\` service in my cookies stock!`)
                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                            .setTimestamp()
                    );
                }

                const generatedCode = firstLine.trim(); // Save the generated code

                const currentTime = new Date();
                const formattedTime = `${currentTime.getFullYear()}-${String(currentTime.getMonth() + 1).padStart(2, '0')}-${String(currentTime.getDate()).padStart(2, '0')} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;

                const redemptionEmbed = new MessageEmbed()
                    .setColor(config.color.green)
                    .setTitle('NEXUS G3N')
                    .setDescription('**Follow these steps to redeem your code:**\nStep 1: Click on this [LINK](https://link-center.net/991963/blue-gen-verify) , complete some steps and register with your Discord nickname.\nStep 2: Go to the Ticket channel\nStep 3: Click on Redeem a code\nStep 4: Send this code to staff:')
                    .addField('Code', `\`\`\`${generatedCode}\`\`\``)
                    .setFooter(`Generated by NEXUS G3N • ${formattedTime}`);

                // DM the user with the embed
                message.author.send({ embeds: [redemptionEmbed] }).catch((err) => {
                    console.error(`Failed to send DM to ${message.author.tag}: ${err}`);
                });

                // Save the code to redeemcodes.txt with the service name
                const redeemFilePath = `${__dirname}/../../redeemcodes/redeemcodes.txt`;
                fs.appendFileSync(redeemFilePath, `${generatedCode} - ${service} in cookies category\n`);

                // Remove the first line from the file
                data = data.slice(position + 1);
                fs.writeFile(filePath, data, (error) => {
                    if (error) {
                        console.error(error);
                    }

                    message.channel.send(
                        new MessageEmbed()
                            .setColor(config.color.green)
                            .setTitle('Account generated successfully!')
                            .setDescription(`Check your DMs, ${message.author}! If you didn't receive the message, please check your privacy settings!`)
                            .setImage(config.gif) // Use the URL from config.json
                            .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                            .setTimestamp()
                    );

                    generated.add(message.author.id);

                    setTimeout(() => {
                        generated.delete(message.author.id);
                    }, config.genCooldown);
                });
            } else {
                return message.channel.send(
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Generator error!')
                        .setDescription(`Service \`${service}\` does not exist in the cookies folder!`)
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                );
            }
        });
    },
};