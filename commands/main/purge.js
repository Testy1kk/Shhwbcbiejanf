const config = require('../../config.json');

module.exports = {
    name: 'purge',
    description: 'Delete a specified number of messages.',
    usage: 'purge <number_of_messages>',

    execute: async (message, args) => {
        // Check if the user has the purge role
        if (!message.member.roles.cache.some(role => config.purgeroleids.includes(role.id))) {
            return message.reply('You do not have the necessary permissions to use this command.');
        }

        // Check if the number of messages to delete is provided
        const deleteCount = parseInt(args[0], 10);

        // Check if the deleteCount is a valid number
        if (isNaN(deleteCount) || deleteCount <= 0) {
            return message.reply('Please provide a valid number of messages to delete.');
        }

        // Ensure the deleteCount does not exceed 100
        if (deleteCount > 100) {
            return message.reply('You cannot delete more than 100 messages at once.');
        }

        try {
            // Fetch messages and delete them
            const fetched = await message.channel.messages.fetch({ limit: deleteCount + 1 });
            await message.channel.bulkDelete(fetched, true);

            // Provide a confirmation message
            const confirmationMessage = await message.channel.send(`Deleted ${deleteCount} messages.`);
            setTimeout(() => {
                confirmationMessage.delete();
            }, 5000);
        } catch (error) {
            console.error('Error purging messages:', error);
            return message.reply('An error occurred while trying to delete messages.');
        }
    },
};