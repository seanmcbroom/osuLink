const { Command } = require('discord-akairo');

class PingCommand extends Command {
    constructor() {
        super('ping', {
            description: 'Get the ping of the bot',
        });
    }

    exec(interaction) {
        return interaction.reply('Pong!');
    }
}

module.exports = PingCommand;