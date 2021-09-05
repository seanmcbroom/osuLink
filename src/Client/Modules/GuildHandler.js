const { Datastore } = require('./Datastore');
const Discord = require('discord.js');

const Emojis = require('../../Modules/Emojis')
const Util = require('../../Modules/Util')
class GuildHandler {
    constructor(client, options = {}) {
        const {
            DataFormat = {}
        } = options;

        this.client = client;

        this._cache = new Map();

        this.DataFormat = DataFormat;

        this.setup();
    }

    setup() {
        this.client.once('ready', () => {
            this.loadAll()

            this.client.on('guildCreate', (guild) => {
                this.Add(guild);
            });

            this.client.on('guildDelete', (guild) => {
                this.Remove(guild);
            });

            this.client.on('guildIntegrationsUpdate', (guild) => {
                this.Reload(guild);
            });
        });
    }

    Add(guildData) {
        const guild = new Guild(this.client, guildData, {
            DataFormat: this.DataFormat
        });

        this._cache.set(guildData.id, guild);

        return guild;
    }

    Remove(guildId) {
        return this._cache.delete(guildId);
    }

    Reload(guildData) {
        this.Remove(guildData.id);
        return this.Add(guildData);
    }

    Get(guildId) {
        return this._cache.get(guildId);
    }

    loadAll() {
        for (const guild of this.client.guilds._cache) {
            const guildData = guild[1];
            this.Add(guildData);
        }
    }
}

class Guild {
    constructor(client, guild, options) {
        const {
            DataFormat = {}
        } = options;

        this.client = client;

        for (const x in guild) {
            this[x] = guild[x];
        };

        this.mostRecentBeatmap = null;

        this.Datastore = new Datastore('Guild', {
            Database: this.client.Database,
            DataFormat: DataFormat,
            id: this.id
        });

        this.loadInteractionsOfTypes(['main', 'test']);
    }

    loadInteractionsOfTypes(types) {
        if (this.client.interactionHandler) {
            this.client.interactionHandler.loadInteractionsOfTypesOnGuild(this, types);
        }
    }


    async updateMember(User) {
        //todo: Update nickname, roles, verified stats, etc.
    }

    async postMemberOsuScore(User, Score, Gain) {
        const trackingWhitelist = await this.Datastore.getData('trackingWhitelist');
        const trackingChannelId = await this.Datastore.getData('trackingChannel');

        const channel = this.channels.cache.find(c => c.id === trackingChannelId);

        if (!channel) return
        if (!trackingWhitelist[User.id]) return
        if (trackingWhitelist[User.id].top < Score.profile_rank) return

        const Embed = new Discord.MessageEmbed()
            .setColor(this.client.Settings.Colors.Main)
            .setAuthor(`${Score.beatmap.title} by ${Score.beatmap.creator}`, Score.player.avatar, Score.beatmap.link)
            .setThumbnail(Score.beatmap.cover_thumbnail)
            .setDescription(
                `${Emojis[Score.getDifficulty()]} __**${Score.beatmap.version}**__ ${Score.mods != '' ? `**${Score.mods}**` : ''} [${Score.starRating()}★]\n` +
                `• **${Emojis[Score.rank]}** • ${`**${Score.profile_pp}pp (+${Gain}pp)**`} • ${Score.accuracy}%\n` +
                `• ${Util.addCommas(Score.score)} • x${Score.maxcombo}/${Score.beatmap.max_combo} • <${Score.count300}/${Score.count100}/${Score.count50}/${Score.countmiss}>\n` +
                `${Score.completion < 100 && `• **Completion:** *${Score.completion}%*` || ''}`
            )
            .setFooter(`Score set ${Util.msToHumanReadable((Date.now() - new Date(Score.date)))} ago on the offical osu server.`)

        channel.send({ content: `New **#${Score.profile_index}** for ${Score.player.username}!`, embeds: [Embed] });
    }
}

module.exports = { GuildHandler, Guild };