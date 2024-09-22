const fs = require('fs').promises;
const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'elist',
    description: 'Show all users and their services in extremegive',
    usage: 'elist',
    async execute(message) {
        try {
            // Read the content of extremegive.txt
            const filePath = `${__dirname}/../../extremegive/extremegive.txt`;
            const data = await fs.readFile(filePath, 'utf8');

            // Check if the file is empty
            if (!data.trim()) {
                return message.channel.send('No data found in the list.');
            }

            // Split the data into lines
            const lines = data.split('\n');

            // Create an embed to display user services
            const embed = new MessageEmbed()
                .setColor(config.color.blue)
                .setTitle('Extreme Give User List')
                .setDescription('List of users and their services in extremegive');

            // Add each user and their service to the embed
            lines.forEach((line) => {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    const parts = trimmedLine.split(' - ');
                    if (parts.length === 2) {
                        const username = parts[0].trim();
                        const service = parts[1].trim();
                        embed.addField(username, service);
                    }
                }
            });

            // Check if the embed length exceeds Discord's limit
            const maxLength = 6000; // Approximate length of the embed description
            if (embed.description.length > maxLength) {
                const chunks = [];
                let currentChunk = '';
                embed.fields.forEach(field => {
                    const fieldString = `${field.name}: ${field.value}\n`;
                    if ((currentChunk + fieldString).length > maxLength) {
                        chunks.push(currentChunk);
                        currentChunk = fieldString;
                    } else {
                        currentChunk += fieldString;
                    }
                });
                if (currentChunk) chunks.push(currentChunk);

                // Send chunks as separate messages
                for (const chunk of chunks) {
                    await message.channel.send(chunk);
                }
            } else {
                // Send the embed if within limit
                message.channel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`Error processing the command: ${error}`);
            return message.channel.send('Error processing the command.');
        }
    },
};