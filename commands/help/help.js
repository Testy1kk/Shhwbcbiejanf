const { MessageEmbed } = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'help',
    description: 'Display the command list.',
    usage: 'help',

    execute(message, usedPrefix) {
        const helpEmbed = new MessageEmbed()
            .setColor(config.color.default)
            .setTitle('Command list')
            .setDescription(`
\`\`.bgen\`\`: Generate a specified basic service if stocked
\`\`.bsgen\`\`: Generate a specified booster service if stocked
\`\`.fgen\`\`: Generate a specified free service if stocked.
\`\`.gen\`\`: Generate a specified service if stocked.
\`\`.stock\`\`: Display the service stock.
\`\`=help\`\`: Display the command list.
\`\`+vouch\`\`: Vouch for a user.
\`\`-vouch\`\`: NegVouch for a user.
            `)
            .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 }) })
            .setTimestamp();

        message.channel.send({ embeds: [helpEmbed] });
    },
};
