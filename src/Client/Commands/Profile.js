const { Command } = require('discord-akairo');
const Discord = require('discord.js')

const Util = require('../../Modules/Util');
const Emojis = require('../../Modules/Emojis')

class ProfileCommand extends Command {
    constructor() {
        super('profile', {
            description: 'View profile of player.',
            ratelimit: 2,
            cooldown: 10000,

            slashCommandOptions: [{
                name: 'player',
                description: 'The player you want to view.',
                type: 'SUB_COMMAND',
                options: [{
                    name: 'user',
                    description: 'The discord user of the player.',
                    type: 'USER'
                }, {
                    name: 'name',
                    description: 'The name of the player.',
                    type: 'STRING'
                }]
            }],

            contextMenu: {
                name: 'Profile (osu!)',
                type: 'USER',
            },
        });
    }

    async exec(interaction) {
        const target = interaction.isContextMenu() ? this.client.users.cache.get(interaction.targetId) : (interaction.options.getUser('user') || interaction.user)
        if (!target) return interaction.reply('No target found, try again.')

        const user = this.client.userHandler.Get(target);
        if (!user) return interaction.reply('Unable to find user, try again later.')

        const osuID = interaction.options.getString('name') || (await user.Datastore.getData('osuID'));
        if (!osuID) return interaction.reply('Target does not have a linked osu account.')

        const osuUser = await this.client.osu.getUser({ identifier: osuID, idetifierType: 'id' });
        if (!osuUser) return interaction.reply('Unabled to find osu account. Try again later.')

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setAuthor(`osu!Stats (${osuUser.username})`, osuUser.avatar, osuUser.profile_link)
            .setThumbnail(osuUser.avatar)
            .setDescription(
                `• **Rank:** #${Util.addCommas(osuUser.pp_rank) || 'NaN'} (#${Util.addCommas(osuUser.pp_country_rank) || 'NaN'} :flag_${osuUser.country.toLowerCase()}:)\n` +
                `• **Playtime:** ${Util.msToHumanReadable(parseInt(osuUser.total_seconds_played) * 1000)} (${Util.msToHours(parseInt(osuUser.total_seconds_played) * 1000)} hours)\n` +
                `• **PP:** ${Util.addCommas(osuUser.pp_raw) || '0'}pp • **Highest:** ${Util.addCommas(await osuUser.getHighestPP())}pp\n\n` +

                `• **Accuracy:** ${(Math.round(parseFloat(osuUser.accuracy) * 100) / 100) || 'NaN'}%\n` +
                `• **Ranked Score:** ${Util.addCommas(osuUser.ranked_score) || 'NaN'}\n\n` +

                `${Emojis['XH']}: ${osuUser.count_rank_ssh || '0'} **|** ${Emojis['X']}: ${osuUser.count_rank_ss || '0'} **|** ${Emojis['SH']}: ${osuUser.count_rank_sh || '0'} **|** ${Emojis['S']}: ${osuUser.count_rank_s || '0'} **|** ${Emojis['A']}: ${osuUser.count_rank_a || '0'}`
            )
            .setFooter(`Account created on ${new Date(osuUser.join_date).toLocaleDateString('en-US')}`)
            .setTimestamp()

        return interaction.reply({ embeds: [Embed] })
    }
}

module.exports = ProfileCommand;