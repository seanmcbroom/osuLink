const { Command } = require('discord-akairo');

class InviteCommand extends Command {
    constructor() {
        super('invite', {
            description: 'Add the bot to another server.',
            tags: ['general'],
        });
    }

    exec(interaction) {
        return interaction.reply(this.client.Settings.Links.Invite);
    }
}

module.exports = InviteCommand;

