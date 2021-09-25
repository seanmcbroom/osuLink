const { Command } = require('discord-akairo');

class UntrackCommand extends Command {
    constructor() {
        super('untrack', {
            description: 'Remove user from tracking.',
            tags: ['management'],

            ratelimit: 5,
            cooldown: 30000,

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
        const user = this.client.userHandler.Get(interaction.options.getUser('user'));
        const guild = this.client.guildHandler.Get(interaction.guild.id);

        if (!user) {
            return interaction.reply({ content: 'No user found, try again.', ephemeral: true });
        }

        let trackingWhitelist = await guild.Datastore.getData('trackingWhitelist');

        if (!trackingWhitelist[user.id]) {
            return interaction.reply({ content: `**${user.username}** is not currently being tracked.`, ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        delete trackingWhitelist[user.id];

        await guild.Datastore.setSetting('trackingWhitelist', trackingWhitelist);

        interaction.followUp({
            content: `No longer tracking **${interaction.options.getUser('user').username}**.`
        });
    }
}

module.exports = UntrackCommand;