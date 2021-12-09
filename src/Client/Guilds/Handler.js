const Guild = require('./Guild');

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

module.exports = GuildHandler;