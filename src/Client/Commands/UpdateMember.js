const { Command } = require('discord-akairo');
const Discord = require('discord.js');

class UpdateMemberCommand extends Command {
    constructor() {
        super('update', {
            description: 'Update a members roles.',
            tags: ['management'],

            ratelimit: 2,
            cooldown: 10000,

            userPermissions: 32n,

            slashCommandOptions: [{
                name: 'member',
                description: 'The member to update.',
                type: 'USER',
                required: true
            }]
        });
    }

    async exec(interaction) {
        const guild = this.client.guildHandler.Get(interaction.guild.id);
        const member = interaction.options.getUser('member');
        const user = this.client.userHandler.Get(interaction.options.getUser('member'));

        if (!user) {
            return interaction.reply({ content: `Unable to update that member!`, ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        member.user = user;

        await guild.updateMember(member);

        return interaction.followUp({
            content: `Updated **${member.username}**!`
        });
    }
}

module.exports = UpdateMemberCommand;