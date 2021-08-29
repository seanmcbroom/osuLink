const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class TrackCommand extends Command {
    constructor() {
        super('track', {
            description: 'Track top scores.',

            userPermissions: 32n,

            slashCommandOptions: [{
                name: 'user',
                description: 'Discord user of the player.',
                type: 'USER',
                required: true
            }, {
                name: 'top',
                description: 'Which top scores to track (1-100).',
                type: 'STRING'
            }]
        });
    }

    async exec(interaction) {
        const guild = this.client.guildHandler.Get(interaction.guild.id);

        const trackingLimit = Math.min(Math.max(interaction.options.getString('top') || 50, 1), 100)
        const trackingWhitelist = await guild.Datastore.getData('trackingWhitelist');
        const trackingChannel = await guild.Datastore.getData('trackingChannel');
        if (!trackingChannel) return interaction.reply('There is no tracking channel set on this server.');

        const user = this.client.userHandler.Get(interaction.options.getUser('user'));
        if (!user) return interaction.reply('No user found, try again.');

        if (trackingWhitelist[user.id]) return interaction.reply('User is already being tracked.');

        trackingWhitelist[user.id] = {
            top: trackingLimit
        };

        guild.Datastore.setSetting('trackingWhitelist', trackingWhitelist);
        interaction.reply(`Now tracking **${interaction.options.getUser('user').username}** top ${trackingLimit}!`);
    }
}

module.exports = TrackCommand;