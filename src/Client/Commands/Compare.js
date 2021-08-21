const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class CompareCommand extends Command {
    constructor() {
        super('compare', {
            description: 'Compare scores.',

            ratelimit: 2,
            cooldown: 10000,

            slashCommandOptions: [{
                name: 'link',
                description: 'The beatmap link.',
                type: 'STRING'
            }, {
                name: 'user',
                description: 'Discord user of the player.',
                type: 'USER'
            }, {
                name: 'name',
                description: 'Name of the player.',
                type: 'STRING'
            }]
        });
    }

    async exec(interaction) {
        const link = interaction.options.getString('link') || this.client.guildHandler.Get(interaction.guild.id).mostRecentBeatmap;
        if (!link) return interaction.reply('No beatmap found.');

        const match = link.match(/(\d+)/g);
        const beatmapId = match ? match[match.length - 1] : null;
        if (!beatmapId) return interaction.reply('No beatmap found.');

        const beatmap = await this.client.osu.getBeatmap({ id: beatmapId })
        if (!beatmap) return interaction.reply('No beatmap found.');

        const target = interaction.isContextMenu() ? this.client.users.cache.get(interaction.targetId) : (interaction.options.getUser('user') || interaction.user)
        if (!target) return interaction.reply('No target found, try again.')

        const user = this.client.userHandler.Get(target);
        if (!user) return interaction.reply('Unable to find user, try again later.')

        const osuID = interaction.options.getString('name') || (await user.Datastore.getData('osuID'));
        if (!osuID) return interaction.reply('Target does not have a linked osu account.')

        const osuUser = await this.client.osu.getUser({ identifier: osuID, idetifierType: 'id' });
        if (!osuUser) return interaction.reply('Unabled to find osu account. Try again later.')

        const scores = await osuUser.getScores({ beatmapId: beatmapId });
        if (!scores) return interaction.reply('No scores found on this map.')
        console.log(scores)

        let Description = ''
        for (const score of scores) {
            Description += (Description == "" && "" || "\n\n") +
                `${Emojis[score.getDifficulty()]} __**${score.beatmap.version}**__ ${score.mods != '' ? `**${score.mods}**` : ''} [${score.starRating()}★] <t:${(new Date(score.date).getTime() / 1000)}:R>\n` +
                `• **${Emojis[score.rank]}** • ${`**${score.pp()}pp**`} ${((score.maxcombo < score.beatmap.max_combo - 5) && ` (${score.fcpp()}pp for ${score.fc_accuracy}% FC)` || '')} • ${score.accuracy}%\n` +
                `• ${Util.addCommas(score.score)} • x${score.maxcombo}/${score.beatmap.max_combo} • <${score.count300}/${score.count100}/${score.count50}/${score.countmiss}>`
        }

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setAuthor(`${scores[0].beatmap.title} by ${scores[0].beatmap.creator}`, osuUser.avatar, scores[0].beatmap.link)
            .setThumbnail(scores[0].beatmap.cover_thumbnail)
            .setDescription(Description)

        this.client.guildHandler.Get(interaction.guild.id).mostRecentBeatmap = scores[0].beatmap.link;

        return interaction.reply({ embeds: [Embed] });
    }
}

module.exports = CompareCommand;