const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Util = require('../../Modules/Util');

class InfoCommand extends Command {
    constructor() {
        super('info', {
            description: 'Get information about the bot.',
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
            .setColor(this.client.mainColor)
            .setThumbnail(this.client.user.avatarURL())
            .setAuthor(`osuLink Information`)
            .setDescription(
                `**Total Servers:** ${Util.addCommas(totalGuilds)} • **Total Members:** ${Util.addCommas(totalMembers)}\n` +
                `**Shard:** #${Util.addCommas(interaction.guild.shardId + 1)} of ${Util.addCommas(this.client.shard.count)} • **Shard Servers:** ${Util.addCommas(this.client.guilds.cache.size)}\n\n` +

                `**Links** › **[Support Server](https://discord.gg/K2dTCmJ)**, **[Invite](https://discord.com/api/oauth2/authorize?client_id=767176248811847691&permissions=2550262800&scope=bot%20applications.commands)**`
            )
            .setFooter(`Performance Point calculation is sourced from ojsama.`)

        return interaction.reply({ embeds: [Embed] });
    }
}

module.exports = InfoCommand;