const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('vouches.db');

module.exports = {
    name: 'top',
    description: 'Display the top users with the most vouches.',
    execute(message) {
        // Retrieve the top ten users with the most vouches from the database
        db.all('SELECT user_id, vouches FROM vouches ORDER BY vouches DESC LIMIT 10', [], (err, rows) => {
            if (err) {
                console.error(`Error retrieving top users: ${err.message}`);
                return;
            }

            // If there are no rows, send a message indicating no vouches
            if (rows.length === 0) {
                return message.channel.send('No vouches data found.');
            }

            // Create an embed to display the top users
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Top 10 Users with Most Vouches')
                .setDescription('Here are the top 10 users with the most vouches:')
                .addFields(
                    { name: 'Rank', value: rows.map((row, index) => `#${index + 1}`).join('\n'), inline: true },
                    { name: 'User', value: rows.map(row => `<@${row.user_id}>`).join('\n'), inline: true },
                    { name: 'Vouches', value: rows.map(row => row.vouches.toString()).join('\n'), inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        });
    },
};