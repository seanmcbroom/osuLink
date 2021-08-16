const { Command } = require('discord-akairo');

class EchoCommand extends Command {
    constructor() {
        super('echo', {
            aliases: [],
            description: 'Make the bot say something.',
            // userPermissions: 1074266248n,
            // clientPermissions: 1074266248n,
            rateLimit: 1,
            cooldown: 50000,
            interactionOptions: [{
                name: 'string',
                description: 'The phrase that will be repeated',
                type: 'STRING',
                required: true
            }]
        });
    }

    exec(interaction) {
        const string = interaction.options.getString('string');

        return interaction.reply(string);
    }
}

module.exports = EchoCommand;