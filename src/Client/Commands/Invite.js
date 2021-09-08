const { Command } = require('discord-akairo');

class InviteCommand extends Command {
    constructor() {
        super('invite', {
            description: 'Add the bot to another server.',
            tags: ['general'],
        });
    }

    exec(interaction) {
        return interaction.reply({ content: this.client.Settings.Links.Invite, ephemeral: true });
    }
}

module.exports = InviteCommand;

