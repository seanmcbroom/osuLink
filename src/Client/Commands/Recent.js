const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class RecentCommand extends Command {
    constructor() {
        super('recent', {
            description: 'View most recent play.',
            tags: ['general'],

            ratelimit: 1,
            cooldown: 10000,

            slashCommandOptions: [{
                name: 'user',
                description: 'Discord user of the player.',
                type: 'USER'
            }, {
                name: 'name',
                description: 'Name of the player.',
                type: 'STRING'
            }, {
                name: 'filter',
                description: 'The method which recent plays will be filtered.',
                type: 'STRING',
                choices: [{
                    name: "best",
                    value: "best"
                }, {
                    name: "worst",
                    value: "worst"
                }, {
                    name: "random",
                    value: "random"
                }],
            }],

            contextMenu: {
                name: 'Recent Play (osu!)',
                type: 'USER'
            }
        });
    }

    async exec(interaction) {
        const target = interaction.isContextMenu()
            ? this.client.users.cache.get(interaction.targetId)
            : (interaction.options.getUser('user') || interaction.user);

        if (!target) {
            return interaction.reply({ content: 'No target found, try again.', ephemeral: true });
        }

        const user = this.client.userHandler.Get(target);

        if (!user) {
            return interaction.reply({ content: 'Unable to find user, try again later.', ephemeral: true });
        }

        const osuIdentifier = interaction.options.getString('name')
            || (await user.Datastore.getData('osuID'));

        if (!osuIdentifier) {
            return interaction.reply({ content: 'Target does not have a linked osu account.', ephemeral: true });
        }

        const osuUser = await this.client.osu.getUser({ identifier: osuIdentifier });

        if (!osuUser) {
            return interaction.reply({ content: `Unable to find osu account, try again later.`, ephemeral: true });
        }

        await interaction.deferReply();

        const recentScore = await osuUser.getRecent({ filter: interaction.options.getString('filter') || 'recent' });

        if (!recentScore) {
            return interaction.reply({ content: 'No recent scores. found.' });
        }

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setAuthor(`${recentScore.beatmap.title} by ${recentScore.beatmap.creator}`, osuUser.avatar, recentScore.beatmap.link)
            .setThumbnail(recentScore.beatmap.cover_thumbnail)
            .setDescription(
                `${Emojis[recentScore.getDifficulty()]} __**${recentScore.beatmap.version}**__ ${recentScore.mods != '' ? `**${recentScore.mods}**` : ''} [${recentScore.starRating()}★]\n` +
                `• **${Emojis[recentScore.rank]}** • ${`**${recentScore.pp()}pp**`} ${(((recentScore.maxcombo < (recentScore.beatmap.max_combo - 3)) || (recentScore.countmiss > 0)) && ` (${recentScore.fcpp()}pp for ${recentScore.fc_accuracy}% FC)` || '')} • ${recentScore.accuracy}%\n` +
                `• ${Util.addCommas(recentScore.score)} • x${recentScore.maxcombo}/${recentScore.beatmap.max_combo} • <${recentScore.count300}/${recentScore.count100}/${recentScore.count50}/${recentScore.countmiss}>\n` +
                `${recentScore.completion < 100 && `• **Completion:** *${recentScore.completion}%*` || ''}`
            )
            .setFooter(`Score set ${Util.msToHumanReadable((Date.now() - new Date(recentScore.date)))} ago on the offical osu server.`)

        this.client.guildHandler.Get(interaction.guild.id).mostRecentBeatmap = recentScore.beatmap.link;

        return interaction.followUp({ embeds: [Embed] });
    }
}

module.exports = RecentCommand;