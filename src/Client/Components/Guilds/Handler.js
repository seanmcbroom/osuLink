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
                this.add(guild);
            });

            this.client.on('guildDelete', (guild) => {
                this.remove(guild);
            });

            this.client.on('guildIntegrationsUpdate', (guild) => {
                this.reload(guild);
            });
        });
    }

    add(guildData) {
        const guild = new Guild(this.client, guildData, {
            DataFormat: this.DataFormat
        });

        this._cache.set(guildData.id, guild);

        return guild;
    }

    remove(guildId) {
        return this._cache.delete(guildId);
    }

    reload(guildData) {
        this.remove(guildData.id);

        return this.add(guildData);
    }

    get(guildId) {
        return this._cache.get(guildId);
    }

    loadAll() {
        for (const guild of this.client.guilds._cache) {
            const guildData = guild[1];
            this.add(guildData);
        }
    }
}

module.exports = GuildHandler;