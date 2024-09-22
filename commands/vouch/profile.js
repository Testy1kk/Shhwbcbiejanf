const { MessageEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('vouches.db');

module.exports = {
    name: 'profile',
    description: 'View a user\'s profile.',
    usage: 'profile <@user>',
    execute(message, args, prefix) {
        if (!message.mentions.users.size) {
            return message.channel.send(`Usage: ${prefix}profile @user`);
        }

        const mentionedUser = message.mentions.users.first();

        db.get('SELECT * FROM vouches WHERE user_id = ?', [mentionedUser.id], (err, row) => {
            if (err) {
                console.error(err);
                return message.channel.send('Error fetching user profile.');
            }

            if (!row) {
                return message.channel.send('User has no vouch data.');
            }

            const joinedAt = mentionedUser.createdAt.toISOString().split('T')[0];
            const vouches = row.vouches || 0;
            const negvouches = row.negvouches || 0;
            const todayVouches = row.todayvouches || 0;
            const last3DaysVouches = row.last3daysvouches || 0;
            const lastWeekVouches = row.lastweekvouches || 0;

            const profileEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(`${mentionedUser.tag}'s Profile`)
                .addField('Joined At', joinedAt)
                .addField('✅ Positive Reviews', vouches.toString())
                .addField('❌ Negative Reviews', negvouches.toString())
                .addField('Today\'s Vouches', todayVouches.toString())
                .addField('Last 3 Days Vouches', last3DaysVouches.toString())
                .addField('Last Week Vouches', lastWeekVouches.toString());

            message.channel.send({ embeds: [profileEmbed] });
        });
    },
};