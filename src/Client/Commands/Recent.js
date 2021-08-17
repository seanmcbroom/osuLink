const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class RecentCommand extends Command {
    constructor() {
        super('recent', {
            description: 'View most recent play.',

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
                name: 'Recent Play (osu!)',
                type: 'USER'
            }
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

        const recentPlay = await osuUser.getRecent();
        if (!recentPlay) return interaction.reply('No recent plays found.')

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.mainColor)
            .setAuthor(`${recentPlay.beatmap.title} by ${recentPlay.beatmap.creator}`, osuUser.avatar, recentPlay.beatmap.link)
            .setThumbnail(recentPlay.beatmap.cover_thumbnail)
            .setDescription(
                `${Emojis[recentPlay.getDifficulty()]} __**${recentPlay.beatmap.version}**__ ${recentPlay.mods != '' ? `**${recentPlay.mods}**` : ''} [${recentPlay.starRating()}★]\n` +
                `• **${Emojis[recentPlay.rank]}** • ${`**${recentPlay.pp()}pp**`} ${((recentPlay.maxcombo < recentPlay.beatmap.max_combo - 5) && ` (${recentPlay.fcpp()}pp for ${recentPlay.fc_accuracy}% FC)` || '')} • ${recentPlay.accuracy}%\n` +
                `• ${Util.addCommas(recentPlay.score)} • x${recentPlay.maxcombo}/${recentPlay.beatmap.max_combo} • <${recentPlay.count300}/${recentPlay.count100}/${recentPlay.count50}/${recentPlay.countmiss}>\n` +
                `${recentPlay.completion < 100 && `• **Completion:** *${recentPlay.completion}%*` || ''}`
            )
            .setFooter(`Played ${Util.msToHumanReadable((Date.now() - new Date(recentPlay.date)))} ago on the offical osu server.`)
            .setTimestamp()

        this.client.guildHandler.Get(interaction.guild.id).mostRecentBeatmap = recentPlay.beatmap.link;

        return interaction.reply({ embeds: [Embed] });
    }
}

module.exports = RecentCommand;