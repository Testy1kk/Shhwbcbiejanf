const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'dm',
    description: 'DM the tagged user with a specified message and delete the original message.',
    usage: 'dm @user [message]',

    async execute(message) {
        const args = message.content.split(' ').slice(1);
        const user = message.mentions.users.first();

        if (!user) {
            return message.reply('Please mention a user to DM.');
        }

        const dmMessage = args.slice(1).join(' ');
        if (!dmMessage) {
            return message.reply('Please provide a message to send.');
        }

        try {
            await user.send(dmMessage);
            await message.delete();

            const confirmationEmbed = new MessageEmbed()
                .setColor('#00FF00')
                .setDescription(`The message has been successfully sent to ${user.tag}.`)
                .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                .setTimestamp();

            const confirmationMessage = await message.channel.send({ embeds: [confirmationEmbed] });

            // Edit the confirmation message to show that the original message was deleted
            setTimeout(() => {
                confirmationEmbed.setDescription(`${confirmationEmbed.description}\n\n**Original message:** [deleted]`);
                confirmationMessage.edit({ embeds: [confirmationEmbed] });
            }, 1000);

        } catch (error) {
            console.error('Error sending DM:', error);
            message.reply('There was an error trying to DM the user.');
        }
    },
};