const fs = require('fs').promises;
const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'echeck',
    description: 'Show accounts given by user from the user database',
    usage: 'echeck',

    async execute(message) {
        try {
            // Read the content of user_database.txt
            const userDbPath = `${__dirname}/../../user_database.txt`;
            const userData = await fs.readFile(userDbPath, 'utf8');

            // Parse user database JSON
            const userDatabase = JSON.parse(userData);

            // Get the user's account count
            const userCount = userDatabase[message.author.id] || 0;

            // Create an embed to display user's account count
            const embed = new MessageEmbed()
                .setColor(config.color.blue)
                .setTitle('User Account Count')
                .setDescription(`Accounts given by ${message.author.tag}`)
                .addField('User', message.author.tag, true)
                .addField('Account Count', userCount, true)
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp();

            // Send the embed to the channel
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`Error processing the command: ${error.message}`);
            return message.channel.send('There was an error processing the command.');
        }
    },
};