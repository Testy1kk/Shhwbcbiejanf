const fs = require('fs');
const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: 'remove',
    description: 'Remove a service from the specified category',
    usage: 'remove <free/basic/boost/premium/cookie/extreme> <servicename>',

    execute: async (message, args) => {
        // Check if the user has the restock role
        const restockRoleId = config.restockroleid;
        if (!message.member.roles.cache.has(restockRoleId) && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have the necessary permissions to use this command.');
        }

        // Check if the command has the correct number of arguments
        if (args.length < 1 || args.length > 2) {
            return message.reply('Please provide the correct arguments. Usage: `remove (free/premium/boost/basic/cookie/extreme) [fileName]`.');
        }

        const keyword = args[0].toLowerCase();

        if (['free', 'premium', 'boost', 'basic', 'cookie', 'extreme'].includes(keyword)) {
            try {
                const folderType = getFolderType(keyword);
                const fileName = getFileName(args[1]);
                const filePath = `./${folderType}/${fileName}`;

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    message.reply(`File ${fileName} removed successfully from the ${folderType} folder.`);
                } else {
                    message.reply('The specified file does not exist.');
                }
            } catch (error) {
                console.error(error);
                message.reply('An error occurred while removing the file.');
            }
        } else {
            return message.channel.send(
                new Discord.MessageEmbed()
                    .setColor(config.color.red)
                    .setTitle('Invalid keyword!')
                    .setDescription('You need to specify a valid keyword ("free", "premium", "boost", "basic", "cookie", or "extreme").')
                    .setFooter(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 64 }))
                    .setTimestamp()
            );
        }
    },
};

function getFolderType(keyword) {
    switch (keyword) {
        case 'free':
            return 'fstock';
        case 'premium':
            return 'stock';
        case 'boost':
            return 'bstock';
        case 'basic':
            return 'basicstock';
        case 'cookie':
            return 'cookies';
        case 'extreme':
            return 'extreme';
        default:
            return '';
    }
}

function getFileName(userProvidedFileName) {
    return userProvidedFileName ? `${userProvidedFileName.toLowerCase()}.txt` : generateRandomFileName();
}

function generateRandomFileName() {
    const randomString = Math.random().toString(36).substring(2, 7);
    return `${randomString}.txt`;
}