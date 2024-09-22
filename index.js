const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;
const db = new sqlite3.Database('vouches.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite3 database:', err.message);
    } else {
        console.log('Connected to SQLite3 database');

        // Create vouches table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS vouches (
            user_id TEXT PRIMARY KEY,
            vouches INTEGER DEFAULT 0,
            negvouches INTEGER DEFAULT 0,
            reasons TEXT DEFAULT '[]',
            todayvouches INTEGER DEFAULT 0,
            last3daysvouches INTEGER DEFAULT 0,
            lastweekvouches INTEGER DEFAULT 0
        )`);
    }
});

app.get('/', (req, res) => res.send('Online Yo boi!'));
app.listen(port, () => console.log('Server is listening on port ' + port));

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.commands = new Collection();

const config = require('./config.json');
const token = config.token;

const commandFolders = fs.readdirSync('./commands');

// Load command files
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);

        let prefix;
        if (folder === 'main') {
            prefix = config.mainPrefix;
        } else if (folder === 'help') {
            prefix = config.helpPrefix;
        } else if (folder === 'vouch') {
            prefix = config.vouchPrefix;
        } else if (folder === 'negvouch') {
            prefix = config.negVouchPrefix;
        } else {
            prefix = config.prefix;
        }

        command.prefix = prefix;

        console.log(`Loaded command: ${prefix}${command.name}`);
        client.commands.set(command.name, command);
    }
}

// Function to check if a channel or role exists in the server
function validateServerConfig() {
    const guilds = client.guilds.cache.map(guild => guild);

    for (const guild of guilds) {
        console.log(`Checking server: ${guild.name} (${guild.id})`);

        // Check if notification channel exists
        const notificationChannel = guild.channels.cache.get(config.notificationChannelId);
        if (!notificationChannel) {
            console.error(`Warning: Notification channel not found in server ${guild.name} (${guild.id}). Check your config.json.`);
        }

        // Check if specified roles exist
        const specifiedRoles = config.specifiedRoleIds || [];
        for (const roleId of specifiedRoles) {
            const role = guild.roles.cache.get(roleId);
            if (!role) {
                console.error(`Warning: Specified role with ID ${roleId} not found in server ${guild.name} (${guild.id}). Check your config.json.`);
            }
        }
    }
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`${config.helpPrefix}help | BLU3 G3N`);

    // Check server configurations on bot start
    validateServerConfig();
});

// Combined event listener for interactionCreate
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Event listener for messageCreate
client.on('messageCreate', async (message) => {
    try {
        if (message.author.bot) return; // Ignore messages from bots

        const prefixes = [
            config.vouchPrefix,
            config.negVouchPrefix,
            config.mainPrefix,
            config.helpPrefix
        ];

        let usedPrefix = null;

        for (const prefix of prefixes) {
            if (message.content.startsWith(prefix)) {
                usedPrefix = prefix;
                break;
            }
        }

        if (!usedPrefix) return; // If no valid prefix is found, ignore the message

        const args = message.content.slice(usedPrefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (config.command.notfound_message && !client.commands.has(command)) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(config.color.red)
                        .setTitle('Unknown command :(')
                        .setDescription(`Sorry, but I cannot find the \`${command}\` command!`)
                        .setFooter({ text: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true, size: 64 }) })
                        .setTimestamp()
                ]
            });
        }

        // Execute the command
        const commandObject = client.commands.get(command);
        if (commandObject && message.content.startsWith(commandObject.prefix)) {
            commandObject.execute(message, args, commandObject.prefix, config.vouchPrefix);
        }

    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Function to process the inactive list
async function processInactiveList() {
    const filePath = path.join(__dirname, '../../inactive_list.txt');
    
    if (!fs.existsSync(filePath)) return;

    const lines = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
    const updatedLines = [];
    const now = new Date();

    for (const line of lines) {
        const [userId, reason, daysStr] = line.split(', ');
        const days = parseInt(daysStr.split(' ')[1], 10);

        if (days > 1) {
            // Update the line with decremented days
            updatedLines.push(line.replace(`Time: ${days} days`, `Time: ${days - 1} days`));
        } else if (days === 1) {
            // Notify user that their inactive time is over
            const guild = client.guilds.cache.first(); // Assuming you have only one guild
            const member = guild.members.cache.get(userId);

            if (member) {
                member.send('Your inactive time has ended. Please wake up!');
            }

            // Do not add this line to updatedLines, effectively removing it
        }
    }

    // Save the updated inactive list, excluding lines where days reached zero
    fs.writeFileSync(filePath, updatedLines.join('\n'));
}

client.login(token);
