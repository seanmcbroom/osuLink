const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class BindCommand extends Command {
    constructor() {
        super('bind', {
            description: 'Bind a role to an in-game achivement.',
            tags: ['management'],

            ratelimit: 2,
            cooldown: 10000,

            userPermissions: 32n,

            slashCommandOptions: [{
                name: 'role',
                description: 'The role to bind to.',
                type: 'ROLE',
                required: true
            }, {
                name: 'condition',
                description: 'The required condition to get the role',
                type: 'STRING',
                required: true
            }]
        });
    }

    async exec(interaction) {
        const guild = this.client.guildHandler.Get(interaction.guild.id);

        const role = interaction.options.getRole('role');
        const condition = interaction.options.getString('condition');

        let binds = await guild.Datastore.getData('Binds');
        const bindId = Object.keys(binds).length + 1;

        if (bindId > guild.maxBinds) {
            return interaction.reply({ content: `This server has reached maximum binds. **(${bindId - 1}/${maxBinds})**`, ephemeral: true });
        }

        if (interaction.guild.me.roles.botRole.rawPosition < role.rawPosition) {
            return interaction.reply({ content: `I can\'t manage this role, please move it under me and try again.`, ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        binds[bindId] = {
            ID: role.id,
            C: condition
        };

        await guild.Datastore.setSetting('Binds', binds);

        interaction.followUp({
            content: `Successfully binded **${role.name}** to \`\`${condition}\`\`!`
        });
    }
}

module.exports = BindCommand;