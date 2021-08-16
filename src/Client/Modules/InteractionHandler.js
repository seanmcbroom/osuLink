const { Routes } = require('discord-api-types/v9');
const { Permissions } = require('discord.js');

const fs = require('fs');
const path = require('path');

const COMMAND_TYPES = {
	'CHAT_INPUT': 1,
	'USER': 2,
	'MESSAGE': 3,
}

const COMMAND_OPTION_TYPES = {
	'SUB_COMMAND': 1,
	'SUB_COMMAND_GROUP': 2,
	'STRING': 3,
	'INTEGER': 4,
	'BOOLEAN': 5,
	'USER': 6,
	'CHANNEL': 7,
	'ROLE': 8,
	'MENTIONABLE': 9,
	'NUMBER': 10
}

class InteractionHandler {
	constructor(client, options) {
		const {
			directory = '',
			defaultCooldown = 0
		} = options;

		this.client = client;

		this.Directory = directory;

		this.cooldowns = new Map();
		this.defaultCooldown = defaultCooldown;

		this.Interactions = {
			Commands: new Map(),
			Structure: [],
		};

		this.setup();
	}

	setup() {
		this.client.once('ready', () => {
			this.client.on('interactionCreate', async interaction => {
				this.handle(interaction);
			});
		});
	}

	async handle(interaction) {
		try {
			if (interaction.isCommand()) {
				const command = this.Interactions.Commands.get(interaction.commandName);
				const reason = await this.runPreCommandChecks(interaction, command);

				if (reason) {
					await interaction.reply(`${reason}`);
					return null;
				}

				if (command && !reason) {
					this.runCommand(command, interaction)
				}
			}

			if (interaction.isContextMenu()) {
				const command = this.Interactions.Commands.get(interaction.commandName);
				const reason = await this.runPreCommandChecks(interaction, command);

				if (reason) {
					await interaction.reply(`${reason}`);
					return null;
				}

				if (command && !reason) {
					this.runCommand(command, interaction, 'ContextMenu');
				}
			}

		} catch (error) {
			console.error(error);
		}
	}

	async runCommand(command, interaction, type) {
		try {
			await command.exec(interaction, type);
		} catch (error) {
			console.log(error);
		}
	}

	async runPreCommandChecks(interaction, command) {
		if (command.ownerOnly) {
			const isOwner = this.client.isOwner(interaction.user.id);
			if (!isOwner) {
				return 'Owner only.'
			}
		}

		const clientMissingPermission = interaction.guild.me.permissionsIn(interaction.channel).missing(new Permissions(command.clientPermissions), false)[0];

		if (clientMissingPermission) {
			return `${this.client.user} missing permission \`\`${clientMissingPermission}\`\`.`
		}

		const memberMissingPermission = interaction.member.permissionsIn(interaction.channel).missing(new Permissions(command.userPermissions), false)[0];

		if (memberMissingPermission) {
			return `${interaction.member} missing permission \`\`${memberMissingPermission}\`\`.`
		}

		const structure = this.Interactions.Structure.filter(structure => structure.name === command.id)[0];
		for (const option of structure.options) {
			if (option.required) {
				if (!interaction.options.get(option.name)) {
					return 'Missing required argument(s).';
				}
			}
		}

		const cooldownTime = this.runCooldown(interaction, command);

		if (cooldownTime) {
			return `Cooldown, try again in ${Math.floor(cooldownTime / 10) / 100} seconds.`
		}

		const reason = await this.inhibitorHandler.test('pre', interaction, command);

		if (reason) {
			return reason
		}
	}

	runCooldown(interaction, command) {
		if (command.ignoreCooldown) return false

		const time = command.cooldown != null ? command.cooldown : this.defaultCooldown;

		if (!time || time <= 0) return false;

		const id = interaction.user.id;
		const endTime = interaction.createdTimestamp + time;

		if (!this.cooldowns.has(id)) this.cooldowns.set(id, {});

		if (!this.cooldowns.get(id)[command.id]) {
			this.cooldowns.get(id)[command.id] = {
				timer: setTimeout(() => {
					if (this.cooldowns.get(id)[command.id]) {
						clearTimeout(this.cooldowns.get(id)[command.id].timer);
					}
					this.cooldowns.get(id)[command.id] = null;

					if (!Object.keys(this.cooldowns.get(id)).length) {
						this.cooldowns.delete(id);
					}
				}, time),
				end: endTime,
				uses: 0
			}
		}

		const entry = this.cooldowns.get(id)[command.id];

		if (entry.uses >= command.ratelimit) {
			const end = this.cooldowns.get(id)[command.id].end;
			const diff = end - interaction.createdTimestamp;

			return diff;
		}

		entry.uses++
		return false;
	}

	register(command) {
		const Command = new command();

		Command.client = this.client;

		Command.slashCommandOptions.forEach(option => { // Convert type to int
			if (option.options) {
				option.options.forEach(suboption => {
					suboption.type = COMMAND_OPTION_TYPES[suboption.type];
				});
			}

			option.type = COMMAND_OPTION_TYPES[option.type]
		});

		this.addCommand(Command);
	}

	addCommand(command) {
		if (command.contextMenu) {
			this.Interactions.Commands.set(command.contextMenu.name, command);

			this.Interactions.Structure.push({
				name: command.contextMenu.name,
				type: COMMAND_TYPES[command.contextMenu.type]
			})
		}

		command.aliases.forEach(alias => {
			this.Interactions.Commands.set(alias, command);

			this.Interactions.Structure.push({
				name: alias,
				description: command.description,
				options: command.slashCommandOptions,
			});
		});

		this.Interactions.Commands.set(command.id, command);

		this.Interactions.Structure.push({
			name: command.id,
			description: command.description,
			options: command.slashCommandOptions,
		});
	}

	loadAll() {
		const commandFiles = fs.readdirSync(this.Directory).filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.resolve(`${this.Directory}/${file}`);
			const command = require(filePath);

			this.register(command);
		}
	}

	async loadSlashCommandsOnGuild(guild) {
		try {
			//console.log(this.Interactions.Structure)
			await this.client.REST.put(
				Routes.applicationGuildCommands(this.client.application.id, guild.id),
				{ body: this.Interactions.Structure }
			);
		} catch (error) {
			// console.error(error);
		}
	}

	useInhibitorHandler(inhibitorHandler) {
		this.inhibitorHandler = inhibitorHandler;
	}
}

module.exports = { InteractionHandler };