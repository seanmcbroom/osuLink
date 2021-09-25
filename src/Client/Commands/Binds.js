const { Command } = require('discord-akairo');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis');
const Util = require('../../Modules/Util');

class BindsCommand extends Command {
    constructor() {
        super('binds', {
            description: 'Manage all server binds.',
            tags: ['management'],

            ratelimit: 2,
            cooldown: 10000,

            userPermissions: 32n,

            slashCommandOptions: []
        });
    }

    async exec(interaction) {
        const guild = this.client.guildHandler.Get(interaction.guild.id);

        let binds = await guild.Datastore.getData('Binds');

        const createBindsEmbeds = () => {
            const Description = (Object.keys(binds).length < 1)
                ? '**None**'
                : (function () {
                    let desc = '';
                    for (const i in binds) {
                        const bind = binds[i];

                        desc += (desc === '' && '' || '\n') +
                            `**${i}** ` + `<@&${bind.ID}>` + ' **>** ' + `**\`\`${bind.C}\`\`**`
                    }
                    return desc;
                })();


            const embeds = [
                new Discord.MessageEmbed()
                    .setColor(this.client.Settings.Colors.Main)
                    .setAuthor(`osuLink Binds`, interaction.guild.iconURL())
                    .setDescription(Description)
            ];

            return embeds;
        }

        const createBindsComponents = () => {
            const components = (Object.keys(binds).length > 0)
                ? [
                    new Discord.MessageActionRow()
                        .addComponents(
                            new Discord.MessageButton()
                                .setCustomId('delete')
                                .setLabel('Delete')
                                .setStyle('DANGER')
                        )
                ]
                : [];

            return components;
        }

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        await interaction.reply({
            embeds: createBindsEmbeds(),
            components: createBindsComponents()
        });


        let scrubberLocation = 1;

        collector.on('collect', async interaction => {
            function createDeleteComponents() {
                const bindNumberComponents = [];

                for (let i = scrubberLocation; i < (scrubberLocation + 5); i++) {
                    if (binds[i]) {
                        bindNumberComponents.push(
                            new Discord.MessageButton()
                                .setCustomId(`${i}`)
                                .setLabel(`${i}`)
                                .setStyle('SECONDARY')
                        );
                    }
                }

                const controlsComponents = []

                if (Object.keys(binds).length > 5) {
                    controlsComponents.push(
                        new Discord.MessageButton()
                            .setCustomId('prev')
                            .setLabel('<-')
                            .setStyle('PRIMARY')
                    );
                }

                controlsComponents.push(
                    new Discord.MessageButton()
                        .setCustomId('exit')
                        .setLabel('x')
                        .setStyle('DANGER')
                );

                if (Object.keys(binds).length > 5) {
                    controlsComponents.push(
                        new Discord.MessageButton()
                            .setCustomId('next')
                            .setLabel('->')
                            .setStyle('PRIMARY')
                    );
                }

                return {
                    bindNumberComponents: bindNumberComponents,
                    controlsComponents: controlsComponents
                }
            }

            let events = {
                'delete': async function (interaction) {
                    await interaction.deferUpdate();

                    let components = createDeleteComponents();

                    await interaction.editReply({
                        embeds: createBindsEmbeds(),
                        components: [
                            new Discord.MessageActionRow()
                                .addComponents(...components.bindNumberComponents),
                            new Discord.MessageActionRow()
                                .addComponents(...components.controlsComponents)
                        ]
                    })
                },

                'exit': async function (interaction) {
                    await interaction.deferUpdate();

                    await interaction.editReply({
                        embeds: createBindsEmbeds(),
                        components: createBindsComponents()
                    });
                },

                'prev': async function (interaction) {
                    await interaction.deferUpdate();

                    scrubberLocation = Math.min(scrubberLocation - 5, 1);

                    let components = createDeleteComponents();

                    await interaction.editReply({
                        embeds: createBindsEmbeds(),
                        components: [
                            new Discord.MessageActionRow()
                                .addComponents(...components.bindNumberComponents),
                            new Discord.MessageActionRow()
                                .addComponents(...components.controlsComponents)
                        ]
                    })
                },

                'next': async function (interaction) {
                    await interaction.deferUpdate();

                    scrubberLocation = Math.max(scrubberLocation + 5, Object.keys(binds).length - 5);

                    let components = createDeleteComponents();

                    await interaction.editReply({
                        embeds: createBindsEmbeds(),
                        components: [
                            new Discord.MessageActionRow()
                                .addComponents(...components.bindNumberComponents),
                            new Discord.MessageActionRow()
                                .addComponents(...components.controlsComponents)
                        ]
                    })
                }
            }

            if (events[interaction.customId]) {
                await events[interaction.customId](interaction);
            } else {
                for (const x in binds) {
                    if (interaction.customId == x) {
                        await interaction.deferUpdate();

                        let newBinds = {};
                        for (const i in binds) {
                            if (i > x) {
                                newBinds[i - 1] = binds[i];
                            } else if (i < x) {
                                newBinds[i] = binds[i];
                            }
                        }

                        binds = newBinds;

                        await guild.Datastore.setSetting('Binds', binds);

                        await interaction.editReply({
                            embeds: createBindsEmbeds(),
                            components: createBindsComponents()
                        });
                    }
                }
            }
        })
    }
}

module.exports = BindsCommand;