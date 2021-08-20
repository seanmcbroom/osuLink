const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const os = require('node-os-utils');
const Util = require('../../Modules/Util');

class SystemCommand extends Command {
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
            .setColor(this.client.Settings.Colors.Main)
            .setThumbnail(this.client.user.avatarURL())
            .setAuthor(`System Information`)
            .setDescription(
                `**Uptime:** ${Util.msToHumanReadable(this.client.uptime)}\n` +
                `**Memory:** ${memoryInfo.usedMemPercentage}% • **CPU:** ${cpuUsage}%\n` +
                `**Ping:** ${Util.addCommas(ping)}ms`
            )
            .setTimestamp()

        return interaction.reply({ embeds: [Embed] });
    }
}

module.exports = SystemCommand;