const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../../config.json');

module.exports = {
    name: 'inactivelist',
    description: 'Display a list of inactive users.',
    usage: '.inactivelist',

    async execute(message) {
        const { inactiveAcceptRoleId } = config;

        // Check if the user has the inactive accept role
        if (!message.member.roles.cache.has(inactiveAcceptRoleId)) {
            return message.reply('You do not have permission to use this command.');
        }

        // Path to the inactive list file
        const filePath = path.join(__dirname, '../../inactive_list.txt');

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return message.reply('No inactive records found.');
        }

        try {
            // Read the file content
            const inactiveRecords = fs.readFileSync(filePath, 'utf-8').trim();

            // Create the embed
            const inactiveEmbed = new MessageEmbed()
                .setColor('#FF0000')
                .setTitle('Inactive Users List')
                .setDescription(inactiveRecords || 'No inactive users found.')
                .setFooter('Inactive list')
                .setTimestamp();

            // Send the embed
            message.channel.send(inactiveEmbed);
        } catch (error) {
            console.error('Error reading inactive list file:', error);
            message.reply('There was an error retrieving the inactive list. Please try again later.');
        }
    },
};