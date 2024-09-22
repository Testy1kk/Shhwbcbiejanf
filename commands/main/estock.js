const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'estock',
    description: 'EXTREME stock',
    usage: 'estock',

    execute: function (message, args, usedPrefix) {
        const folderType = 'extreme';
        const folderPath = `${__dirname}/../../${folderType}/`;

        try {
            const fileNames = fs.readdirSync(folderPath)
                .filter(file => file.endsWith('.txt'))
                .map(file => file.slice(0, -4)); // Remove the '.txt' extension

            if (fileNames.length > 0) {
                const embed = new MessageEmbed()
                    .setColor(config.color.blue)
                    .setTitle(`List of Services in ${folderType} Category`)
                    .setDescription(fileNames.join('\n'))
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp();

                // Check if the embed description exceeds Discord's limit
                const maxLength = 4096; // Maximum length for embed description
                if (embed.description.length > maxLength) {
                    const chunks = [];
                    let currentChunk = '';

                    embed.description.split('\n').forEach(line => {
                        const fieldString = `${line}\n`;
                        if ((currentChunk + fieldString).length > maxLength) {
                            chunks.push(currentChunk);
                            currentChunk = fieldString;
                        } else {
                            currentChunk += fieldString;
                        }
                    });

                    if (currentChunk) chunks.push(currentChunk);

                    // Send chunks as separate messages
                    chunks.forEach(chunk => {
                        message.channel.send({
                            embeds: [new MessageEmbed()
                                .setColor(config.color.blue)
                                .setTitle(`List of Services in ${folderType} Category`)
                                .setDescription(chunk)
                                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                                .setTimestamp()
                            ]
                        });
                    });
                } else {
                    message.channel.send({ embeds: [embed] });
                }
            } else {
                message.channel.send({
                    embeds: [new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('No Services Found!')
                        .setDescription(`There are no services in the ${folderType} category.`)
                        .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                        .setTimestamp()
                    ]
                });
            }
        } catch (error) {
            console.error(`Error processing the command: ${error}`);
            message.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('An error occurred!')
                    .setDescription('An error occurred while processing the command.')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
                ]
            });
        }
    },
};