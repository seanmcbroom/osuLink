const { Command } = require('discord-akairo');
const Discord = require('discord.js');
const Util = require('../../Modules/Util');

const os = require('node-os-utils');

class SystemCommand extends Command {
    constructor() {
        super('system', {
            description: 'View system information about the bot.',
            tags: ['dev']
        });
    }

    async exec(interaction) {
        const ping = (Date.now() - interaction.createdTimestamp);

        const cpuUsage = await os.cpu.usage();
        const memoryInfo = await os.mem.info();

        interaction.reply({
            embeds: [
                new Discord.MessageEmbed()
                    .setColor(this.client.Settings.Colors.Main)
                    .setThumbnail(this.client.user.avatarURL())
                    .setAuthor(`System Information`)
                    .setDescription(
                        `**Uptime:** ${Util.msToHumanReadable(this.client.uptime)}\n` +
                        `**Memory:** ${memoryInfo.usedMemPercentage}% • **CPU:** ${cpuUsage}%\n` +
                        `**Ping:** ${Util.addCommas(ping)}ms`
                    )
                    .setTimestamp()
            ],
            ephemeral: true
        });
    }
}

module.exports = SystemCommand;