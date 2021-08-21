const { Command } = require('discord-akairo');
const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');
const Discord = require('discord.js');

class MapCommand extends Command {
    constructor() {
        super('map', {
            description: 'View the information of a map.',

            ratelimit: 1,
            cooldown: 10000,

            slashCommandOptions: [{
                name: 'link',
                description: 'The beatmap link.',
                type: 'STRING'
            }, {
                name: 'mods',
                description: 'The mods that will be applied.',
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

        const mods = this.client.osu.getMods({ identifier: interaction.options.getString('mods') || 'NM' });

        let Embed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setAuthor(`${beatmap.title} by ${beatmap.creator}`, `http://s.ppy.sh/a/${beatmap.creator_id}`, beatmap.link)
            .setThumbnail(beatmap.cover_thumbnail)
            .setDescription(
                `${Emojis[beatmap.getDifficulty({ mods: mods })]} __**${beatmap.version}**__ ${mods != '' ? `**${mods}**` : ''} [${beatmap.stars({ mods: mods })}★] *([mirror download](https://chimu.moe/en/d/${beatmap.beatmapset_id}))*\n` +
                `• **Length:** ${Util.formatTimeMinutesSeconds((beatmap.total_length / mods.speedMultiplier) * 1000)} • **Combo:** ${beatmap.max_combo}\n` +
                `• **AR:** ${mods.calculateAR(beatmap.diff_approach)} • **OD:** ${mods.calculateOD(beatmap.diff_overall)}` +
                `• **HP:** ${mods.calculateHP(beatmap.diff_drain)} • **CS:** ${mods.calculateCS(beatmap.diff_size)}`
            )
            .setFooter(`95%▸${beatmap.calculatePP({ mods: mods, accuracy: 95 })}pp • 98%▸${beatmap.calculatePP({ mods: mods, accuracy: 98 })}pp • 100%▸${beatmap.calculatePP({ mods: mods })}pp`)

        this.client.guildHandler.Get(interaction.guild.id).mostRecentBeatmap = beatmap.link;

        return interaction.reply({ embeds: [Embed] });
    }
}

module.exports = MapCommand;