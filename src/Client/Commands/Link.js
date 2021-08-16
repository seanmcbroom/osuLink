const { Command } = require('discord-akairo');
const Discord = require('discord.js');

class LinkCommand extends Command {
    constructor() {
        super('link', {
            aliases: ['setosu'],
            description: 'Link an osu account to osuLink.',

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
        if (!user) return interaction.reply('Unexpected error, try again later.');

        const username = interaction.options.getString('username');
        if (!username) return interaction.reply('Unexpected error, try again later.');

        const osuUser = await this.client.osu.getUser({ identifier: username, identifierType: 'string' });
        if (!osuUser) return interaction.reply('Couldn\'t find user with that name.')

        const currentUserId = await user.Datastore.getData('osuID');
        if (osuUser.user_id == currentUserId) return interaction.reply('Your account is already linked.')

        let helpEmbed = new Discord.MessageEmbed()
            .setColor(this.client.mainColor)
            .setAuthor('osuLink Help', this.client.user.avatarURL())

        const discordTag = await osuUser.getDiscordTag();

        if (!discordTag) {
            return interaction.reply({
                embeds: [
                    helpEmbed.setDescription(
                        '**There was no discord tag found on your profile.**\n' +
                        'To verify this account belongs to you, please add your tag **[here](https://osu.ppy.sh/home/account/edit)**.\n'
                    )
                ]
            });
        }

        const isDiscordTagCorrect = (discordTag === interaction.user.tag);

        if (!isDiscordTagCorrect) {
            return interaction.reply({
                embeds: [
                    helpEmbed.setDescription(
                        '**Your discord tag is either outdated or incorrect.**\n' +
                        'To verify this account belongs to you, please update your tag **[here](https://osu.ppy.sh/home/account/edit).**\n'
                    )
                ]
            });
        }

        await user.Datastore.setSetting('osuID', osuUser.user_id);

        return interaction.reply('Succesfully linked osu account!')
    }
}

module.exports = LinkCommand;