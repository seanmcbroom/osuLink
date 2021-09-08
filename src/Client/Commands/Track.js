const { Command } = require('discord-akairo');
const Util = require('../../Modules/Util');

class TrackCommand extends Command {
    constructor() {
        super('track', {
            description: 'Track top scores.',
            tags: ['general', 'management'],

            ratelimit: 5,
            cooldown: 30000,

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
        const user = this.client.userHandler.Get(interaction.options.getUser('user'));

        if (!user) {
            return interaction.reply({ content: `No user found, try again.`, ephemeral: true });
        }

        const trackingLimit = Util.clamp(interaction.options.getString('top') || 50, 1, 100)
        const trackingChannel = await guild.Datastore.getData('trackingChannel');
        let trackingWhitelist = await guild.Datastore.getData('trackingWhitelist');

        if (!trackingChannel) {
            return interaction.reply({ content: `There is no tracking channel set on this server.`, ephemeral: true });
        }

        if (trackingWhitelist[user.id]) {
            return interaction.reply({ content: `**${user.username}** is already being tracked.`, ephemeral: true });
        }

        interaction.deferReply({ ephemeral: true });

        trackingWhitelist[user.id] = {
            top: trackingLimit
        };

        await guild.Datastore.setSetting('trackingWhitelist', trackingWhitelist);

        return interaction.followUp({ content: `Now tracking **${interaction.options.getUser('user').username}**'s top ${trackingLimit}!` });
    }
}

module.exports = TrackCommand;