const { Command } = require('discord-akairo');
const Discord = require('discord.js');

class LinkCommand extends Command {
    constructor() {
        super('link', {
            description: 'Link an osu account to osuLink.',
            aliases: ['setosu'],
            tags: ['general'],

            ratelimit: 2,
            cooldown: 60000,

            slashCommandOptions: [{
                name: 'username',
                description: 'Your osu username.',
                type: 'STRING',
                required: true
            }]
        });
    }

    async exec(interaction) {
        const user = this.client.userHandler.Get(interaction.user);

        if (!user) {
            return interaction.reply({ content: 'Unexpected error, try again later.', ephemeral: true });
        }

        const osuUser = await this.client.osu.getUser({
            identifier: interaction.options.getString('username'),
            identifierType: 'string'
        });

        if (!osuUser) {
            return interaction.reply({ content: 'Couldn\'t find user with that name.', ephemeral: true });
        }

        const currentUserId = await user.Datastore.getData('osuID');

        if (osuUser.user_id == currentUserId) {
            return interaction.reply({ content: 'Your account is already linked.', ephemeral: true });
        }

        const discordTag = await osuUser.getDiscordTag();

        let helpEmbed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setAuthor('osuLink Help', this.client.user.avatarURL())

        if (!discordTag) {
            return interaction.reply({
                embeds: [
                    helpEmbed.setDescription(
                        '**There was no discord tag found on your profile.**\n' +
                        'To verify this account belongs to you, please add your discord **[here](https://osu.ppy.sh/home/account/edit)**.\n'
                    )
                ],
                ephemeral: true
            });
        }

        if (discordTag !== interaction.user.tag) {
            return interaction.reply({
                embeds: [
                    helpEmbed.setDescription(
                        '**Your discord tag is either outdated or incorrect.**\n' +
                        'To verify this account belongs to you, please update your discord **[here](https://osu.ppy.sh/home/account/edit).**\n'
                    )
                ],
                ephemeral: true
            });
        }

        await user.Datastore.setSetting('osuID', osuUser.user_id);

        interaction.reply({ content: `Succesfully linked osu account **${osuUser.username}**!` });
    }
}

module.exports = LinkCommand;