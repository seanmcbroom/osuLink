const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class TopCommand extends Command {
    constructor() {
        super('top', {
            description: 'View top plays.',

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
            }],

            contextMenu: {
                name: 'Top Plays (osu!)',
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

        const scores = await osuUser.getBestScores();
        if (!scores) return interaction.reply('No scores found, try again later.')

        let Description = ''
        for (const score of scores) {
            Description += (Description == "" && "" || "\n\n") +
                `__**${score.beatmap.title}**__ <t:${(new Date(score.date).getTime() / 1000)}:R>\n` +
                `${Emojis[score.getDifficulty()]} [${score.beatmap.version}] ${score.mods != '' ? `**${score.mods}**` : ''} [${score.starRating()}★]\n` +
                `• **${Emojis[score.rank]}** • ${`**${score.pp()}pp**`} ${((score.maxcombo < score.beatmap.max_combo - 5) && ` (${score.fcpp()}pp for ${score.fc_accuracy}% FC)` || '')} • ${score.accuracy}%\n` +
                `• ${Util.addCommas(score.score)} • x${score.maxcombo}/${score.beatmap.max_combo} • <${score.count300}/${score.count100}/${score.count50}/${score.countmiss}>`
        }

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setAuthor(`Best scores (${osuUser.username})`, osuUser.avatar, osuUser.profile_link)
            .setThumbnail(osuUser.avatar)
            .setDescription(Description)

        return interaction.reply({ embeds: [Embed] });
    }
}

module.exports = TopCommand;