const { Datastore } = require('./Datastore');

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
        this.id = guild.id;

        this.mostRecentBeatmap = null;

        this.Datastore = new Datastore('Guild', {
            Database: this.client.Database,
            DataFormat: DataFormat,
            id: this.id
        });

        this.client.interactionHandler.loadSlashCommandsOnGuild(this);
    }


    async updateMember(User) {
        //todo: Update nickname, roles, verified stats, etc.
    }

    async postMemberOsuScore(User, Score) {
        console.log(User.username, Score)
        //todo: Post osu scores to tracking channel.
    }
}

module.exports = { GuildHandler, Guild };