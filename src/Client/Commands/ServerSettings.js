const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const settings = [{
    name: 'Verified Role',
    value: 'verifiedrole',
}, {
    name: 'Tracking Channel',
    value: 'trackingchannel'
}]

class ServerSettingsCommand extends Command {
    constructor() {
        super('serversettings', {
            description: 'Manage server settings.',
            userPermissions: 32n,
            ratelimit: 1,
            cooldown: 5000,

            slashCommandOptions: [{
                name: 'get',
                description: 'View server settings.',
                type: 'SUB_COMMAND'
            }, {
                name: 'set',
                description: 'Set a setting.',
                type: 'SUB_COMMAND',
                options: [{
                    name: 'setting',
                    type: 'STRING',
                    description: 'Name of the setting you want to change.',
                    required: true,
                    choices: settings
                }, {
                    name: 'value',
                    description: 'The value to change the setting to.',
                    type: 'STRING',
                    required: true
                }]
            }, {
                name: 'remove',
                description: 'Remove a setting.',
                type: 'SUB_COMMAND',
                options: [{
                    name: 'setting',
                    type: 'STRING',
                    description: 'Name of the setting you want to remove.',
                    required: true,
                    choices: settings
                }]
            }]
        });
    }

    async exec(interaction) {
        const guildDatastore = this.client.guildHandler.Get(interaction.guild.id).Datastore;

        const subcommand = interaction.options.getSubcommand();
        const setting = interaction.options.getString('setting');
        const value = interaction.options.getString('value');

        const DataModifiers = {
            verifiedrole: {
                set: async (value) => {
                    const match = value.match(/(\d+)/);
                    const roleId = match ? match[0] : null;
                    if (!roleId) return interaction.reply('I could not find the role id, please try again.');

                    const role = interaction.guild.roles.cache.find(r => r.id === roleId);
                    if (!role) return interaction.reply('I could not find that role, please try again.');

                    const botRole = interaction.guild.me.roles.botRole;
                    if (botRole.rawPosition < role.rawPosition) return interaction.reply('I can\'t manage this role, please move it under me and try again.');

                    const currentRoleId = await guildDatastore.getData('verifiedRole');
                    if (currentRoleId == roleId) return interaction.reply('This verified role is already set!');

                    await guildDatastore.setSetting('verifiedRole', roleId);

                    return interaction.reply('Successfully set verified role!');
                },

                remove: async () => {
                    const verifiedRole = await guildDatastore.getData('verifiedRole');
                    if (!verifiedRole) return interaction.reply('There is no verification role set on this server.');

                    await guildDatastore.setSetting('verifiedRole', null);

                    interaction.reply('Successfully removed verified role.');
                }
            },
            trackingchannel: {
                set: async (value) => {
                    const match = value.match(/(\d+)/);
                    const channelId = match ? match[0] : null;
                    if (!channelId) return interaction.reply('I could not find the channel id, please try again.');

                    const channel = interaction.guild.channels.cache.find(c => c.id === channelId);
                    if (!channel) return interaction.reply('I could not find that channel, please try again.');

                    const currentChannelId = await guildDatastore.getData('trackingChannel');
                    if (currentChannelId == channelId) return interaction.reply('This tracking channel is already set!');

                    await guildDatastore.setSetting('trackingChannel', channelId);

                    return interaction.reply('Successfully set tracking channel!');
                },

                remove: async () => {
                    const trackingChannel = await guildDatastore.getData('trackingChannel');
                    if (!trackingChannel) return interaction.reply('There is no tracking channel set on this server.');

                    await guildDatastore.setSetting('trackingChannel', null);

                    interaction.reply('Successfully removed tracking channel.');
                }
            }
        }

        const subcommands = {
            set: () => {
                DataModifiers[setting].set(value);
            },
            remove: () => {
                DataModifiers[setting].remove();
            },
            get: async () => {
                const verifiedRole = await guildDatastore.getData('verifiedRole');
                const trackingChannel = await guildDatastore.getData('trackingChannel');

                const Embed = new Discord.MessageEmbed()
                    .setColor(this.client.Settings.Colors.Main)
                    .setThumbnail(interaction.guild.iconURL())
                    .setAuthor(`${interaction.guild.name}'s Settings`)
                    .setDescription(
                        `**Verified Role:** ${verifiedRole ? `<@&${verifiedRole}>` : '``None``'}\n` +
                        `**Tracking Channel:** ${trackingChannel ? `<#${trackingChannel}>` : '``None``'}\n`
                    )
                    .setTimestamp()

                return interaction.reply({ embeds: [Embed] });
            }
        }

        subcommands[subcommand]()
    }
}

module.exports = ServerSettingsCommand;