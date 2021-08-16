const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const os = require('node-os-utils');
const Util = require('../../Modules/Util');

class PingCommand extends Command {
    constructor() {
        super('system', {
            description: 'View system information about the bot.',
        });
    }

    async exec(interaction) {
        const ping = (Date.now() - interaction.createdTimestamp);

        const cpuUsage = await os.cpu.usage();
        const memoryInfo = await os.mem.info();

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.mainColor)
            .setAuthor(`System Information`)
            .setThumbnail(this.client.user.avatarURL())
            .setDescription(
                `**Uptime:** ${Util.msToHumanReadable(this.client.uptime)}\n` +
                `**Memory:** ${memoryInfo.usedMemPercentage}% • **CPU:** ${cpuUsage}%\n` +
                `**Ping:** ${Util.addCommas(ping)}ms`
            )

        return interaction.reply({ embeds: [Embed] });
    }
}

module.exports = PingCommand;