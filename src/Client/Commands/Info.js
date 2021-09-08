const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Util = require('../../Modules/Util');

class InfoCommand extends Command {
    constructor() {
        super('info', {
            description: 'Get information about the bot.',
            tags: ['general'],
        });
    }

    async exec(interaction) {
        const totalGuilds = (await this.client.shard.broadcastEval((client) => {
            return client.guilds.cache.size;
        })).reduce((p, n) => p + n, 0);

        const totalMembers = (await this.client.shard.broadcastEval((client) => {
            return client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0);
        })).reduce((p, n) => p + n, 0);

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setThumbnail(this.client.user.avatarURL())
            .setAuthor(`osuLink Information`)
            .setDescription(
                `**Total Servers:** ${Util.addCommas(totalGuilds)} • **Total Members:** ${Util.addCommas(totalMembers)}\n` +
                `**Shard:** #${Util.addCommas(interaction.guild.shardId + 1)} of ${Util.addCommas(this.client.shard.count)} • **Shard Servers:** ${Util.addCommas(this.client.guilds.cache.size)}\n\n` +

                `**Links** › **[Support Server](${this.client.Settings.Links.SupportServer})**, **[Invite](${this.client.Settings.Links.Invite})**`
            )
            .setFooter(`Performance Point calculation is sourced from ojsama.`)

        return interaction.reply({ embeds: [Embed], ephemeral: true });
    }
}

module.exports = InfoCommand;