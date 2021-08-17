const { Command } = require('discord-akairo');

class InviteCommand extends Command {
    constructor() {
        super('invite', {
            description: 'Add the bot to another server.',
        });
    }

    exec(interaction) {
        return interaction.reply('https://discord.com/api/oauth2/authorize?client_id=767176248811847691&permissions=2550262800&scope=bot%20applications.commands');
    }
}

module.exports = InviteCommand;

