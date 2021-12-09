const { Datastore } = require('../Modules/Datastore');
const Tracker = require('./Tracker');

class User {
    constructor(handler, discordUser, options) {
        const {
            DataFormat = {}
        } = options;
        this.handler = handler;

        for (const i in discordUser) {
            this[i] = discordUser[i];
        };

        this.Datastore = new Datastore('User', {
            Database: this.handler.client.Database,
            DataFormat: DataFormat,
            id: this.id
        });

        this.osuUser = this.getOsuUser();

        this.track();
    }

    track() {
        if (!this.tracker) {
            this.tracker = new Tracker(this, {
                nextCheck: {
                    default: 0,
                    min: 0.2,
                    max: 3
                }
            });
        }

        this.tracker.start();
    }

    untrack() {
        if (this.tracker) {
            this.tracker.stop();
        }
    }

    getGuildMembers() {
        let Members = [];

        for (const guild of this.handler.client.guilds._cache) {
            const member = guild[1].members._cache.get(this.id)
            if (member) {
                member.guild = this.handler.client.guildHandler.Get(guild[1].id);

                Members.push(member);
            }
        }

        return Members;
    }

    async getOsuUser() {
        if (this.osuUser) return this.osuUser;

        if (this.handler.client.osu) {
            const osuID = await this.Datastore.getData('osuID');

            if (!osuID) return null

            const osuUser = await this.handler.client.osu.getUser({
                identifier: osuID,
                identifierType: 'id'
            });

            this.osuUser = osuUser;

            return osuUser;
        }
    }
}

module.exports = User;