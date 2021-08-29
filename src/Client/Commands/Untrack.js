const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class UntrackCommand extends Command {
    constructor() {
        super('untrack', {
            description: 'Remove user from tracking.',

            userPermissions: 32n,

            slashCommandOptions: [{
                name: 'user',
                description: 'Discord user of the player.',
                type: 'USER',
                required: true
            }]
        });
    }

    async exec(interaction) {
        const guild = this.client.guildHandler.Get(interaction.guild.id);

        const trackingWhitelist = await guild.Datastore.getData('trackingWhitelist');

        const user = this.client.userHandler.Get(interaction.options.getUser('user'));
        if (!user) return interaction.reply('No user found, try again.');

        if (!trackingWhitelist[user.id]) return interaction.reply('User is not being tracked.');

        trackingWhitelist[user.id] = null;

        guild.Datastore.setSetting('trackingWhitelist', trackingWhitelist);
        interaction.reply(`No longer tracking **${interaction.options.getUser('user').username}**.`);
    }
}

module.exports = UntrackCommand;